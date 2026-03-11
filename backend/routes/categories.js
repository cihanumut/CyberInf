const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');

// GET /categories  (gereksinim #17)
router.get('/', ctrl.getCategories);

// GET /categories/:categoryId/blogs  (gereksinim #18)
router.get('/:categoryId/blogs', ctrl.getCategoryBlogs);

// POST /categories  🔒 Admin only
router.post('/', protect, restrictTo('admin'), ctrl.createCategory);

// DELETE /categories/:categoryId  🔒 Admin only
router.delete('/:categoryId', protect, restrictTo('admin'), ctrl.deleteCategory);

module.exports = router;
