const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
// Routes
const authRoutes          = require('./routes/auth');
const userRoutes          = require('./routes/users');
const blogRoutes          = require('./routes/blogs');
const commentRoutes       = require('./routes/comments');
const categoryRoutes      = require('./routes/categories');
const uploadRoutes        = require('./routes/upload');
const notificationRoutes  = require('./routes/notifications');
const { connectRedis } = require('./utils/redisClient');
const { connectRabbitMQ } = require('./utils/rabbitClient');
const app = express();
app.set('trust proxy', 1);
// ── Güvenlik ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['https://cyberinf.com.tr', 'https://www.cyberinf.com.tr', 'http://localhost:3000'],
  credentials: true
}));
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Çok fazla istek gönderildi, lütfen bekleyin.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Çok fazla giriş denemesi, lütfen bekleyin.' }
});
app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/password-reset', authLimiter);
// ── Body Parsing ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// ── Logging ───────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Static files
app.use('/uploads', express.static('uploads'));
// ── Routes ────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/blogs',          blogRoutes);
app.use('/api/comments',       commentRoutes);
app.use('/api/categories',     categoryRoutes);
app.use('/api/upload',         uploadRoutes);
app.use('/api/notifications',  notificationRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CyberBlog API çalışıyor', version: '2.0.0' });
});
// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: `${req.originalUrl} endpoint bulunamadı.` });
});
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Sunucu hatası'
  });
});
// ── External Services & Startup ─────────────────
const startServer = async () => {
  try {
    await connectRedis();
    console.log('✅ Redis bağlantısı başarılı');
  } catch (err) {
    console.error('⚠️ Redis bağlanamadı, devam ediliyor:', err.message);
  }

  try {
    await connectRabbitMQ();
    console.log('✅ RabbitMQ bağlantısı başarılı');
  } catch (err) {
    console.error('⚠️ RabbitMQ bağlanamadı, devam ediliyor:', err.message);
  }

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB bağlantısı başarılı');
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 CyberBlog API → https://api.cyberinf.com.tr/api`);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB bağlantı hatası:', err);
      process.exit(1);
    });
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

startServer();
module.exports = app;
