const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık zorunlu'],
    trim: true,
    maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'İçerik zorunlu']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Özet en fazla 500 karakter olabilir']
  },
  coverImage: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  // Admin tarafından reddedilirse sebep
  rejectionReason: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readTime: {
    type: Number, // dakika cinsinden
    default: 1
  }
}, { timestamps: true });

// Slug oluşturma
postSchema.pre('save', async function(next) {
  if (!this.isModified('title')) return next();
  
  let slug = slugify(this.title, { lower: true, strict: true, locale: 'tr' });
  
  // Slug benzersizlik kontrolü
  const existingPost = await mongoose.model('Post').findOne({ slug, _id: { $ne: this._id } });
  if (existingPost) {
    slug = `${slug}-${Date.now()}`;
  }
  
  this.slug = slug;
  
  // Okuma süresi hesaplama (ortalama 200 kelime/dakika)
  const wordCount = this.content.split(' ').length;
  this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  
  next();
});

// Özet otomatik oluşturma
postSchema.pre('save', function(next) {
  if (!this.excerpt && this.content) {
    // Markdown işaretlerini temizle ve kısalt
    const plainText = this.content.replace(/[#*`\[\]]/g, '').trim();
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  next();
});

// Index'ler (arama için)
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ slug: 1 });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ category: 1 });

module.exports = mongoose.model('Post', postSchema);
