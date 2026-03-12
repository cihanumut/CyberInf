const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CloudinaryStorage import - farklı yöntemler dene
let CloudinaryStorage;
try {
  // Yöntem 1
  CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
} catch {
  try {
    // Yöntem 2
    CloudinaryStorage = require('multer-storage-cloudinary');
  } catch {
    // Yöntem 3
    const pkg = require('multer-storage-cloudinary');
    CloudinaryStorage = pkg.CloudinaryStorage || pkg.default || pkg;
  }
}

// Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cyberinf',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }]
  }
});

// Upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Geçersiz dosya türü'), false);
    }
  }
});

// Upload endpoint
router.post('/image', protect, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Dosya boyutu 20MB\'dan büyük olamaz.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi.' });
    }

    return res.status(200).json({
      message: 'Resim başarıyla yüklendi.',
      url: req.file.path,
      filename: req.file.filename
    });
  });
});

module.exports = router;
