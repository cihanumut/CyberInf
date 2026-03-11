const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commentController');
const { protect, restrictTo } = require('../middleware/auth');

// GET /comments?status=pending  🔒 Admin (gereksinim #11)
// Kullanıcılar kendi yorumlarını görebilir, admin hepsini
router.get('/', protect, ctrl.getComments);

// PUT /comments/:commentId  🔒 (gereksinim #12)
router.put('/:commentId', protect, ctrl.updateComment);

// DELETE /comments/:commentId  🔒 (gereksinim #13)
router.delete('/:commentId', protect, ctrl.deleteComment);

module.exports = router;
