const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kategori adı zorunlu'],
    unique: true,
    trim: true,
    maxlength: [50, 'Kategori adı en fazla 50 karakter olabilir']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [300, 'Açıklama en fazla 300 karakter olabilir'],
    default: ''
  },
  icon: {
    type: String,
    default: '📁'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Slug otomatik oluştur
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
