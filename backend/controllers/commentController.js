const Comment = require('../models/Comment');
const Post = require('../models/Post');

// ──────────────────────────────────────────────
// POST /blogs/:blogId/comments
// Yorum ekleme (giriş gerekli)
// ──────────────────────────────────────────────
exports.createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const { blogId } = req.params;

    if (!content || !content.trim())
      return res.status(400).json({ error: 'Yorum içeriği zorunlu.' });

    const blog = await Post.findById(blogId);
    if (!blog || blog.status !== 'published')
      return res.status(404).json({ error: 'Blog yazısı bulunamadı.' });

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) return res.status(404).json({ error: 'Üst yorum bulunamadı.' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: blogId,
      parentComment: parentComment || null,
      status: 'pending'
    });

    await comment.populate('author', 'username avatar');

    res.status(201).json({
      message: 'Yorumunuz inceleme için gönderildi.',
      comment
    });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Blog bulunamadı.' });
    res.status(500).json({ error: 'Yorum eklenirken hata oluştu.' });
  }
};

// ──────────────────────────────────────────────
// GET /comments?status=pending   (Admin)
// Onay bekleyen (veya tüm) yorumları listele
// ──────────────────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, blogId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (blogId) query.post = blogId;

    // Admin değilse sadece kendi yorumlarını görebilir
    if (req.user.role !== 'admin') {
      query.author = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('author', 'username avatar')
        .populate('post', 'title slug')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Comment.countDocuments(query)
    ]);

    res.json({
      comments,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalComments: total
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Yorumlar alınırken hata oluştu.' });
  }
};

// ──────────────────────────────────────────────
// PUT /comments/:commentId
// Yorum güncelleme — yazar veya admin
// ──────────────────────────────────────────────
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Yorum bulunamadı.' });

    const isSelf = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin)
      return res.status(403).json({ error: 'Bu yorumu düzenleme yetkiniz yok.' });

    const { content, status } = req.body;

    if (content !== undefined) {
      if (!content.trim()) return res.status(400).json({ error: 'Yorum içeriği boş olamaz.' });
      comment.content = content.trim();
      comment.isEdited = true;
      // Kullanıcı düzenlerse tekrar onaya gider
      if (!isAdmin) comment.status = 'pending';
    }

    // Admin: status değiştirebilir (onay/red)
    if (isAdmin && status && ['pending', 'approved', 'rejected'].includes(status)) {
      comment.status = status;
    }

    await comment.save();
    await comment.populate('author', 'username avatar');
    await comment.populate('post', 'title slug');

    res.json({
      message: !isAdmin && content ? 'Yorum güncellendi ve tekrar incelemeye gönderildi.' : 'Yorum güncellendi.',
      comment
    });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Yorum bulunamadı.' });
    res.status(500).json({ error: 'Yorum güncellenirken hata oluştu.' });
  }
};

// ──────────────────────────────────────────────
// DELETE /comments/:commentId
// Yorum silme — yazar veya admin
// ──────────────────────────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Yorum bulunamadı.' });

    const isSelf = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin)
      return res.status(403).json({ error: 'Bu yorumu silme yetkiniz yok.' });

    // Alt yorumları da sil
    await Comment.deleteMany({ parentComment: req.params.commentId });
    await comment.deleteOne();

    res.json({ message: 'Yorum silindi.' });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Yorum bulunamadı.' });
    res.status(500).json({ error: 'Yorum silinirken hata oluştu.' });
  }
};
// POST /blogs/:blogId/comments/:commentId/like
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Yorum bulunamadı.' });

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save({ validateBeforeSave: false });

    res.json({
      liked: !isLiked,
      likesCount: comment.likes.length
    });
  } catch (err) {
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};
