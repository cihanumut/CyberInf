const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { redisClient } = require('../utils/redisClient');
const { sendActivityLog } = require('../utils/rabbitClient');

// GET /blogs
exports.getBlogs = async (req, res) => {
  try {
    const cacheKey = `blogs_${JSON.stringify(req.query)}_${req.user?.role || 'user'}`;
    if (redisClient && redisClient.isReady) {
        const cachedBlogs = await redisClient.get(cacheKey);
        if (cachedBlogs) return res.json({ ...JSON.parse(cachedBlogs), cached: true });
    }

    const { page = 1, limit = 10, search, tag, sort = '-createdAt', status } = req.query;
    
    const query = {};
    if (req.user && req.user.role === 'admin' && status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag.toLowerCase();

    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username avatar')
        .populate('category', 'name slug icon')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-content'),
      Post.countDocuments(query)
    ]);

    const responseData = {
      blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBlogs: total,
        hasNext: skip + blogs.length < total,
        hasPrev: Number(page) > 1
      }
    };

    if (redisClient && redisClient.isReady) {
        await redisClient.setEx(cacheKey, 60 * 5, JSON.stringify(responseData));
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: 'Bloglar yüklenirken hata oluştu.' });
  }
};

// GET /blogs/:blogId
exports.getBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = blogId.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: blogId, ...(isAdmin ? {} : { status: 'published' }) }
      : { slug: blogId, ...(isAdmin ? {} : { status: 'published' }) };

    const blog = await Post.findOneAndUpdate(
      filter,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username avatar bio')
      .populate('category', 'name slug icon');

    if (!blog) return res.status(404).json({ error: 'Blog yazısı bulunamadı.' });

    const currentUserId = req.user ? req.user._id : null;
    
    // Onaylı yorumların hepsini (yanıtlar dahil) getir + kullanıcının kendi onay bekleyen yorumlarını getir
    const commentQuery = {
      post: blog._id,
      $or: [
        { status: 'approved' },
        ...(currentUserId ? [{ author: currentUserId, status: 'pending' }] : [])
      ]
    };

    const comments = await Comment.find(commentQuery)
      .populate('author', 'username avatar')
      .populate({
        path: 'parentComment',
        populate: { path: 'author', select: 'username' }
      })
      .sort('-createdAt');

    res.json({ blog, comments });
  } catch (err) {
    res.status(500).json({ error: 'Blog yüklenirken hata oluştu.' });
  }
};

// POST /blogs
exports.createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, categoryId, tags, coverImage, status } = req.body;

    if (categoryId) {
      const cat = await Category.findById(categoryId);
      if (!cat) return res.status(400).json({ error: 'Geçersiz kategori.' });
    }

    const allowedStatus = req.user.role === 'admin'
      ? (status || 'pending')
      : (status === 'draft' ? 'draft' : 'pending');

    const blog = await Post.create({
      title,
      content,
      category: categoryId || null,
      tags: tags || [],
      coverImage: coverImage || null,
      status: allowedStatus,
      author: req.user._id
    });

    await blog.populate([
      { path: 'author', select: 'username avatar' },
      { path: 'category', select: 'name slug icon' }
    ]);

    if (redisClient && redisClient.isReady) await redisClient.flushAll();
    sendActivityLog('blog_created', req.user ? req.user.username : 'Unknown');

    res.status(201).json({
      message: allowedStatus === 'draft' ? 'Taslak kaydedildi.' : 'Blog yazınız inceleme için gönderildi.',
      blog
    });
  } catch (err) {
    res.status(500).json({ error: 'Blog oluşturulurken hata oluştu.' });
  }
};

// PUT /blogs/:blogId
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Post.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: 'Blog yazısı bulunamadı.' });

    const isSelf = blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Bu blog yazısını düzenleme yetkiniz yok.' });
    }

    const { title, content, categoryId, tags, coverImage, status, rejectionReason } = req.body;

    if (categoryId) {
      const cat = await Category.findById(categoryId);
      if (!cat) return res.status(400).json({ error: 'Geçersiz kategori.' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (categoryId !== undefined) updates.category = categoryId;
    if (tags !== undefined) updates.tags = tags;
    if (coverImage !== undefined) updates.coverImage = coverImage;

    const previousStatus = blog.status;

    if (isAdmin) {
      if (status) updates.status = status;
      if (rejectionReason !== undefined) updates.rejectionReason = rejectionReason;

      // Bildirim: onay veya red
      if (status && status !== previousStatus) {
        if (status === 'published') {
          await createNotification({
            recipient: blog.author,
            sender: req.user._id,
            type: 'post_approved',
            message: `"${blog.title}" başlıklı yazınız yayınlandı! 🎉`,
            post: blog._id
          });

          // Takipçilere bildirim gönder
          const author = await User.findById(blog.author).select('followers username');
          if (author && author.followers?.length > 0) {
            const notifPromises = author.followers.map(followerId =>
              createNotification({
                recipient: followerId,
                sender: blog.author,
                type: 'following_new_post',
                message: `@${author.username} yeni bir yazı paylaştı: "${blog.title}"`,
                post: blog._id
              })
            );
            await Promise.all(notifPromises);
          }
        } else if (status === 'rejected') {
          await createNotification({
            recipient: blog.author,
            sender: req.user._id,
            type: 'post_rejected',
            message: `"${blog.title}" başlıklı yazınız reddedildi.${rejectionReason ? ` Sebep: ${rejectionReason}` : ''}`,
            post: blog._id
          });
        }
      }
    } else {
      updates.status = status === 'draft' ? 'draft' : 'pending';
      updates.rejectionReason = null;
    }

    const updatedBlog = await Post.findByIdAndUpdate(req.params.blogId, updates, {
      new: true, runValidators: true
    }).populate([
      { path: 'author', select: 'username avatar' },
      { path: 'category', select: 'name slug icon' }
    ]);

    if (redisClient && redisClient.isReady) await redisClient.flushAll();
    res.json({ message: 'Blog yazısı güncellendi.', blog: updatedBlog });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Blog yazısı bulunamadı.' });
    res.status(500).json({ error: 'Blog güncellenirken hata oluştu.' });
  }
};

// DELETE /blogs/:blogId
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Post.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: 'Blog yazısı bulunamadı.' });

    const isSelf = blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Bu blog yazısını silme yetkiniz yok.' });
    }

    await Promise.all([
      Post.findByIdAndDelete(req.params.blogId),
      Comment.deleteMany({ post: req.params.blogId })
    ]);

    if (redisClient && redisClient.isReady) await redisClient.flushAll();
    res.json({ message: 'Blog yazısı ve tüm yorumları silindi.' });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Blog yazısı bulunamadı.' });
    res.status(500).json({ error: 'Blog silinirken hata oluştu.' });
  }
};

// POST /blogs/:blogId/like
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Post.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: 'Yazı bulunamadı.' });

    const userId = req.user._id;
    const isLiked = blog.likes.includes(userId);

    if (isLiked) {
      blog.likes.pull(userId);
    } else {
      blog.likes.push(userId);
      
      // Bildirim: Yazı sahibi kendisi değilse bildirim gönder
      if (blog.author.toString() !== userId.toString()) {
        await createNotification({
          recipient: blog.author,
          sender: userId,
          type: 'post_like',
          message: `@${req.user.username} yazınızı beğendi: "${blog.title}"`,
          post: blog._id
        });
      }
    }

    await blog.save({ validateBeforeSave: false });

    res.json({ liked: !isLiked, likesCount: blog.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};
