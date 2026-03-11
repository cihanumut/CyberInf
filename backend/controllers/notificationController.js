const Notification = require('../models/Notification');

// GET /notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username avatar')
      .populate('post', 'title slug')
      .sort('-createdAt')
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Bildirimler alınamadı.' });
  }
};

// PUT /notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Tüm bildirimler okundu.' });
  } catch (err) {
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};

// PUT /notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ message: 'Bildirim okundu.' });
  } catch (err) {
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};

// Yardımcı: bildirim oluştur
exports.createNotification = async ({ recipient, sender, type, message, post }) => {
  try {
    if (recipient.toString() === sender?.toString()) return; // kendine bildirim gönderme
    await Notification.create({ recipient, sender, type, message, post });
  } catch (err) {
    console.error('Bildirim oluşturulamadı:', err.message);
  }
};