const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const blogCtrl = require('../controllers/blogController');
const commentCtrl = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');

// ── Blog CRUD ──────────────────────────────────

// GET /blogs  (gereksinim yok ama listeleme gerekli)
router.get('/', optionalAuth, blogCtrl.getBlogs);

// GET /blogs/:blogId
router.get('/:blogId', optionalAuth, blogCtrl.getBlog);

// POST /blogs  🔒 (gereksinim #14)
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Başlık zorunlu'),
  body('content').notEmpty().withMessage('İçerik zorunlu')
], blogCtrl.createBlog);

// PUT /blogs/:blogId  🔒 (gereksinim #15)
router.put('/:blogId', protect, blogCtrl.updateBlog);

// DELETE /blogs/:blogId  🔒 (gereksinim #16)
router.delete('/:blogId', protect, blogCtrl.deleteBlog);

// POST /blogs/:blogId/like  🔒
router.post('/:blogId/like', protect, blogCtrl.toggleLike);

// ── Yorum CRUD (blog altında) ─────────────────

// POST /blogs/:blogId/comments  🔒 (gereksinim #10)
router.post('/:blogId/comments', protect, [
  body('content').trim().notEmpty().withMessage('Yorum içeriği zorunlu')
], commentCtrl.createComment);
// POST /blogs/:blogId/comments/:commentId/like  🔒
router.post('/:blogId/comments/:commentId/like', protect, commentCtrl.toggleLike);
module.exports = router;
