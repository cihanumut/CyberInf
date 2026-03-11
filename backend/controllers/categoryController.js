const Category = require('../models/Category');
const Post = require('../models/Post');

// ──────────────────────────────────────────────
// GET /categories
// Tüm kategorileri listele
// ──────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'username')
      .sort('name');

    // Her kategori için blog sayısını ekle
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const blogCount = await Post.countDocuments({
          category: cat._id,
          status: 'published'
        });
        return {
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          blogCount,
          createdAt: cat.createdAt
        };
      })
    );

    res.json({ categories: categoriesWithCount });
  } catch (err) {
    res.status(500).json({ error: 'Kategoriler alınırken hata oluştu.' });
  }
};

// ──────────────────────────────────────────────
// GET /categories/:categoryId/blogs
// Belirli kategoriye ait blogları getir
// ──────────────────────────────────────────────
exports.getCategoryBlogs = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // ID veya slug ile ara
    const isObjectId = categoryId.match(/^[0-9a-fA-F]{24}$/);
    const category = isObjectId
      ? await Category.findById(categoryId)
      : await Category.findOne({ slug: categoryId });

    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı.' });

    const query = { category: category._id, status: 'published' };
    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username avatar')
        .populate('category', 'name slug icon')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-content'),
      Post.countDocuments(query)
    ]);

    res.json({
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon
      },
      blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBlogs: total,
        hasNext: skip + blogs.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Kategori bulunamadı.' });
    res.status(500).json({ error: 'Kategori blogları alınırken hata oluştu.' });
  }
};

// ──────────────────────────────────────────────
// POST /categories  (Admin only)
// Yeni kategori oluştur
// ──────────────────────────────────────────────
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Kategori adı zorunlu.' });

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) return res.status(400).json({ error: 'Bu kategori adı zaten mevcut.' });

    const category = await Category.create({
      name, description, icon, createdBy: req.user._id
    });

    res.status(201).json({ message: 'Kategori oluşturuldu.', category });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Bu kategori adı zaten mevcut.' });
    res.status(500).json({ error: 'Kategori oluşturulurken hata oluştu.' });
  }
};

// ──────────────────────────────────────────────
// DELETE /categories/:categoryId  (Admin only)
// Kategori silme
// ──────────────────────────────────────────────
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı.' });

    // Bu kategoriye ait blogları kategorisiz bırak
    await Post.updateMany(
      { category: req.params.categoryId },
      { $set: { category: null } }
    );

    await category.deleteOne();
    res.json({ message: 'Kategori silindi. Bu kategoriye ait bloglar kategorisiz olarak güncellendi.' });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Kategori bulunamadı.' });
    res.status(500).json({ error: 'Kategori silinirken hata oluştu.' });
  }
};
