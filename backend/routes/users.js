const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

// GET /users/:userId  🔒 (giriş gerekli — gereksinim #6)
router.get('/:userId', protect, ctrl.getUser);

// PUT /users/:userId  🔒 (gereksinim #7)
router.put('/:userId', protect, ctrl.updateUser);

// DELETE /users/:userId  🔒 (gereksinim #8)
router.delete('/:userId', protect, ctrl.deleteUser);

// GET /users/:userId/blogs  🔒 (gereksinim #9)
// Admin → tüm durumlar, kullanıcı → kendi yazıları, diğerleri → sadece published
router.get('/:userId/blogs', optionalAuth, ctrl.getUserBlogs);

router.post('/:userId/follow', protect, ctrl.toggleFollow);

// YENİ: Takipçi ve Takip Edilen Listeleri (Mobil Uygulama İçin)
router.get('/:userId/followers', protect, ctrl.getFollowers);
router.get('/:userId/following', protect, ctrl.getFollowing);

module.exports = router;
