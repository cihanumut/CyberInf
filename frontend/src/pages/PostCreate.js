import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';
import { blogService, categoryService, uploadService } from '../utils/api';
import './PostCreate.css';

export default function PostCreate() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({ title: '', categoryId: '', tags: '', coverImage: '' });
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then(r => setCategories(r.data.categories || []));
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageUpload = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await uploadService.uploadImage(fd);
      setForm(p => ({ ...p, coverImage: data.url }));
      toast.success('Kapak resmi yüklendi!');
    } catch {
      toast.error('Resim yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (asDraft = false) => {
    if (!form.title.trim()) return toast.error('Başlık zorunlu.');
    if (!content.trim()) return toast.error('İçerik zorunlu.');

    setSubmitting(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await blogService.createBlog({
        title: form.title,
        content,
        categoryId: form.categoryId || undefined,
        tags,
        coverImage: form.coverImage || undefined,
        status: asDraft ? 'draft' : 'pending'
      });
      toast.success(asDraft ? 'Taslak kaydedildi.' : 'Yazınız incelemeye gönderildi!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-create-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title"><span>//</span> Yeni Yazı</h1>
          <p className="page-subtitle">Siber güvenlik topluluğuyla bilgini paylaş</p>
        </div>

        <div className="create-layout">
          <div className="create-main">
            <div className="form-group">
              <label className="form-label">Başlık</label>
              <input
                name="title"
                className="form-input title-input"
                placeholder="Yazı başlığını girin..."
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">İçerik (Markdown)</label>
              <div data-color-mode="dark">
                <MDEditor value={content} onChange={setContent} height={500} preview="live" />
              </div>
            </div>
          </div>

          <div className="create-sidebar">
            <div className="card">
              <h3 className="sidebar-title">Yayın Ayarları</h3>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select name="categoryId" className="form-input" value={form.categoryId} onChange={handleChange}>
                  <option value="">Kategori seçin...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Etiketler (virgülle ayır)</label>
                <input
                  name="tags"
                  className="form-input"
                  placeholder="xss, sql-injection, ctf..."
                  value={form.tags}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kapak Resmi</label>
                {form.coverImage ? (
                  <div className="cover-preview">
                    <img src={form.coverImage} alt="Kapak" />
                    <button className="btn btn-sm btn-danger" onClick={() => setForm(p => ({ ...p, coverImage: '' }))}>
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <div
                    className="upload-zone"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleImageUpload(file);
                    }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                    />
                    {uploading ? (
                      <span className="text-muted">Yükleniyor...</span>
                    ) : (
                      <>
                        <span className="upload-icon">📁</span>
                        <span>Tıkla veya sürükle</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>PNG, JPG, WEBP — max 5MB</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="sidebar-actions">
                <button className="btn btn-secondary" onClick={() => handleSubmit(true)} disabled={submitting}>
                  Taslak Kaydet
                </button>
                <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
                  {submitting ? 'Gönderiliyor...' : 'Onaya Gönder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
