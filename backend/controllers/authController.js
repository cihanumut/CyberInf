const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
  return { accessToken, refreshToken };
};

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'kullanıcı adı';
      return res.status(400).json({ error: `Bu ${field} zaten kullanılıyor.` });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.create({
      username,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken: verificationToken
    });

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${email}`;
    try {
      await sendVerificationEmail(email, verifyUrl);
    } catch (emailErr) {
      console.error('Doğrulama maili gönderilemedi:', emailErr.message);
    }

    const response = { message: 'Hesabınız oluşturuldu. Lütfen email adresinizi doğrulayın.' };
    if (process.env.NODE_ENV === 'development') {
      response.devVerifyUrl = verifyUrl;
      response.devToken = verificationToken;
    }

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu.' });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Email veya şifre hatalı.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Email veya şifre hatalı.' });

    if (!user.isActive)
      return res.status(401).json({ error: 'Hesabınız devre dışı bırakılmış.' });

    if (!user.isEmailVerified)
      return res.status(401).json({ error: 'Email adresinizi doğrulamanız gerekiyor.', emailNotVerified: true });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Giriş başarılı!',
      accessToken, refreshToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio }
    });
  } catch (err) {
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu.' });
  }
};

// GET /auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ error: 'Geçersiz doğrulama linki.' });

    const user = await User.findOne({ email }).select('+emailVerificationToken');
    if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });
    if (user.isEmailVerified) return res.json({ message: 'Email zaten doğrulanmış.' });
    if (user.emailVerificationToken !== token) return res.status(400).json({ error: 'Geçersiz doğrulama token\'ı.' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.' });
  } catch (err) {
    res.status(500).json({ error: 'Doğrulama sırasında hata oluştu.' });
  }
};

// POST /auth/resend-verification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+emailVerificationToken');
    if (!user) return res.json({ message: 'Eğer bu email kayıtlıysa doğrulama maili gönderildi.' });
    if (user.isEmailVerified) return res.status(400).json({ error: 'Bu email zaten doğrulanmış.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${email}`;
    await sendVerificationEmail(email, verifyUrl);

    res.json({ message: 'Doğrulama maili tekrar gönderildi.' });
  } catch (err) {
    res.status(500).json({ error: 'Mail gönderilemedi.' });
  }
};

// POST /auth/logout
exports.logout = async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save({ validateBeforeSave: false });
    res.json({ message: 'Başarıyla çıkış yapıldı.' });
  } catch (err) {
    res.status(500).json({ error: 'Çıkış sırasında hata oluştu.' });
  }
};

// POST /auth/password-reset
exports.passwordResetRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email adresi zorunlu.' });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'Eğer bu email kayıtlıysa şifre sıfırlama linki gönderildi.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailErr) {
      console.error('Email gönderilemedi:', emailErr);
    }

    const response = { message: 'Eğer bu email kayıtlıysa şifre sıfırlama linki gönderildi.' };
    if (process.env.NODE_ENV === 'development') {
      response.devResetUrl = resetUrl;
      response.devToken = resetToken;
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Şifre sıfırlama isteği gönderilemedi.' });
  }
};

// POST /auth/password-reset/confirm
exports.passwordResetConfirm = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword)
      return res.status(400).json({ error: 'Token, email ve yeni şifre zorunlu.' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Token geçersiz veya süresi dolmuş.' });

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Şifreniz başarıyla güncellendi. Lütfen tekrar giriş yapın.' });
  } catch (err) {
    res.status(500).json({ error: 'Şifre güncellenirken hata oluştu.' });
  }
};

// POST /auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token gerekli.' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ error: 'Geçersiz refresh token.' });

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz refresh token.' });
  }
};

// GET /auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    user: {
      id: user._id, username: user.username, email: user.email,
      role: user.role, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0
    }
  });
};
