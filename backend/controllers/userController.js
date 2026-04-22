const User = require('../models/User');
const Post = require('../models/Post');

// GET /users/:userId
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-refreshToken');
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const isSelf = req.user._id.toString() === req.params.userId;
    const isAdmin = req.user.role === 'admin';
    const isFollowing = req.user.following?.map(id => id.toString()).includes(req.params.userId);

    const profile = {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      isFollowing: isFollowing || false
    };

    if (isSelf || isAdmin) {
      profile.email = user.email;
      profile.isActive = user.isActive;
    }

    res.json({ user: profile });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.status(500).json({ error: 'Kullanıcı bilgileri alınırken hata oluştu.' });
  }
};

// PUT /users/:userId
exports.updateUser = async (req, res) => {
  try {
    const isSelf = req.user._id.toString() === req.params.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Başka bir kullanıcının profilini güncelleyemezsiniz.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const { username, bio, avatar, email } = req.body;
    const updates = {};

    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    if (email !== undefined && isSelf) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) return res.status(400).json({ error: 'Bu email adresi zaten kullanımda.' });
      updates.email = email;
    }

    if (isAdmin && !isSelf) {
      if (req.body.role && ['user', 'admin'].includes(req.body.role)) updates.role = req.body.role;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, updates, {
      new: true,
      runValidators: true
    }).select('-refreshToken');

    res.json({
      message: 'Profil güncellendi.',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        role: updatedUser.role
      }
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Bu kullanıcı adı veya email zaten kullanımda.' });
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.status(500).json({ error: 'Profil güncellenirken hata oluştu.' });
  }
};

// DELETE /users/:userId
exports.deleteUser = async (req, res) => {
  try {
    const isSelf = req.user._id.toString() === req.params.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Başka bir kullanıcının hesabını silemezsiniz.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const Comment = require('../models/Comment');
    await Promise.all([
      Post.deleteMany({ author: req.params.userId }),
      Comment.deleteMany({ author: req.params.userId }),
      User.findByIdAndDelete(req.params.userId)
    ]);

    res.json({ message: 'Hesap ve tüm ilgili veriler kalıcı olarak silindi.' });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.status(500).json({ error: 'Hesap silinirken hata oluştu.' });
  }
};

// GET /users/:userId/blogs
exports.getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const isSelf = req.user && req.user._id.toString() === userId;
    const isAdmin = req.user && req.user.role === 'admin';

    const query = { author: userId };

    if (isAdmin) {
      if (status) query.status = status;
    } else if (isSelf) {
      if (status) query.status = status;
    } else {
      query.status = 'published';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username avatar')
        .populate('category', 'name slug icon')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .select('-content'),
      Post.countDocuments(query)
    ]);

    res.json({
      blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBlogs: total,
        hasNext: skip + blogs.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.status(500).json({ error: 'Blog yazıları alınırken hata oluştu.' });
  }
};

// POST /users/:userId/follow
exports.toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetId === currentUserId.toString()) {
      return res.status(400).json({ error: 'Kendinizi takip edemezsiniz.' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const isFollowing = req.user.following?.map(id => id.toString()).includes(targetId);

    if (isFollowing) {
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });
      const updatedUser = await User.findById(targetId);
      
      res.json({ 
        following: false, 
        message: 'Takipten çıkıldı.',
        followersCount: updatedUser.followers?.length || 0,
        followingCount: updatedUser.following?.length || 0
      });
    } else {
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUserId } });
      const updatedUser = await User.findById(targetId);

      const { createNotification } = require('./notificationController');
      await createNotification({
        recipient: targetId,
        sender: currentUserId,
        type: 'new_follower',
        message: `@${req.user.username} sizi takip etmeye başladı.`
      });

      res.json({ 
        following: true, 
        message: 'Takip edildi.',
        followersCount: updatedUser.followers?.length || 0,
        followingCount: updatedUser.following?.length || 0
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};

// GET /users/:userId/followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('followers', 'username avatar bio');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ followers: user.followers });
  } catch (err) {
    res.status(500).json({ error: 'Takipçiler alınırken hata oluştu.' });
  }
};

// GET /users/:userId/following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('following', 'username avatar bio');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ following: user.following });
  } catch (err) {
    res.status(500).json({ error: 'Takip edilenler alınırken hata oluştu.' });
  }
};

// GET /users (Arama ve Listeleme)
exports.getUsers = async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .select('username avatar bio role createdAt followers following')
      .limit(Number(limit));

    const formattedUsers = users.map(u => ({
      id: u._id,
      username: u.username,
      avatar: u.avatar,
      bio: u.bio,
      role: u.role,
      followersCount: u.followers?.length || 0,
      followingCount: u.following?.length || 0
    }));

    res.json({ users: formattedUsers });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcılar aranırken hata oluştu.' });
  }
};
