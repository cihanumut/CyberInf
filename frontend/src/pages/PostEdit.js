import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';
import { blogService, categoryService } from '../utils/api';

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', categoryId: '', tags: '', coverImage: '' });
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then(r => setCategories(r.data.categories || []));
    blogService.getBlog(id)
      .then(r => {
        const blog = r.data.blog;
        setForm({
          title: blog.title || '',
          categoryId: blog.category?._id || blog.category || '',
          tags: blog.tags?.join(', ') || '',
          coverImage: blog.coverImage || ''
        });
        setContent(blog.content || '');
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (asDraft = false) => {
    if (!form.title.trim() || !content.trim()) return toast.error('Başlık ve içerik zorunlu.');
    setSubmitting(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await blogService.updateBlog(id, {
        title: form.title,
        content,
        categoryId: form.categoryId || undefined,
        tags,
        coverImage: form.coverImage || undefined,
        status: asDraft ? 'draft' : 'pending'
      });
      toast.success('Yazı güncellendi!');
      navigate('/dashboard');
    } catch { toast.error('Güncelleme başarısız.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}><span>//</span> Yazıyı Düzenle</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div className="form-group">
            <label className="form-label">Başlık</label>
            <input className="form-input" style={{ fontSize: '1.1rem' }} value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">İçerik</label>
            <div data-color-mode="dark">
              <MDEditor value={content} onChange={setContent} height={500} preview="live" />
            </div>
          </div>
        </div>
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-input" value={form.categoryId}
              onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
              <option value="">Kategori seçin...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Etiketler</label>
            <input className="form-input" value={form.tags} placeholder="xss, ctf..."
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => handleSubmit(true)} disabled={submitting}>
              Taslak Kaydet
            </button>
            <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? 'Kaydediliyor...' : 'Güncelle & Onaya Gönder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
