const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// İstatistikler
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers, totalPosts, pendingPosts, publishedPosts,
      totalComments, pendingComments
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: 'pending' }),
      Post.countDocuments({ status: 'published' }),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' })
    ]);

    res.json({
      users: { total: totalUsers },
      posts: { total: totalPosts, pending: pendingPosts, published: publishedPosts },
      comments: { total: totalComments, pending: pendingComments }
    });
  } catch (err) {
    res.status(500).json({ error: 'İstatistikler yüklenirken hata oluştu.' });
  }
};

// Onay bekleyen yazılar
exports.getPendingPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find({ status: 'pending' })
      .populate('author', 'username email avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments({ status: 'pending' });
    res.json({ posts, total });
  } catch (err) {
    res.status(500).json({ error: 'Yazılar yüklenirken hata oluştu.' });
  }
};

// Yazı onaylama/reddetme
exports.reviewPost = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz işlem.' });
    }

    const update = {
      status: action === 'approve' ? 'published' : 'rejected',
      rejectionReason: action === 'reject' ? rejectionReason : null
    };

    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('author', 'username email');

    if (!post) return res.status(404).json({ error: 'Yazı bulunamadı.' });

    res.json({
      message: action === 'approve' ? 'Yazı yayınlandı.' : 'Yazı reddedildi.',
      post
    });
  } catch (err) {
    res.status(500).json({ error: 'İşlem sırasında hata oluştu.' });
  }
};

// Onay bekleyen yorumlar
exports.getPendingComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const comments = await Comment.find({ status: 'pending' })
      .populate('author', 'username avatar')
      .populate('post', 'title slug')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Comment.countDocuments({ status: 'pending' });
    res.json({ comments, total });
  } catch (err) {
    res.status(500).json({ error: 'Yorumlar yüklenirken hata oluştu.' });
  }
};

// Yorum onaylama/reddetme
exports.reviewComment = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz işlem.' });
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: action === 'approve' ? 'approved' : 'rejected' },
      { new: true }
    ).populate('author', 'username');

    if (!comment) return res.status(404).json({ error: 'Yorum bulunamadı.' });

    res.json({
      message: action === 'approve' ? 'Yorum onaylandı.' : 'Yorum reddedildi.',
      comment
    });
  } catch (err) {
    res.status(500).json({ error: 'İşlem sırasında hata oluştu.' });
  }
};

// Tüm kullanıcılar
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcılar yüklenirken hata oluştu.' });
  }
};

// Kullanıcı aktif/pasif yapma veya rol değiştirme
exports.updateUser = async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role && ['user', 'admin'].includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    res.json({ message: 'Kullanıcı güncellendi.', user });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu.' });
  }
};
