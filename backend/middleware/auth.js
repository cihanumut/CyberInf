const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token doğrulama
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Bu işlem için giriş yapmanız gerekiyor.' });
    }

    // Token doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcı hâlâ var mı?
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Bu token\'a ait kullanıcı artık mevcut değil.' });
    }

    // Kullanıcı aktif mi?
    if (!user.isActive) {
      return res.status(401).json({ error: 'Hesabınız devre dışı bırakılmış.' });
    }

    // Token süresi dolmuş mu?
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ error: 'Şifreniz değiştirilmiş. Lütfen tekrar giriş yapın.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Geçersiz token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token süresi dolmuş, lütfen tekrar giriş yapın.' });
    }
    next(err);
  }
};

// Rol kontrolü
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
    }
    next();
  };
};

// Opsiyonel auth (giriş yapmadan da erişilebilir ama user bilgisi eklenir)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};
