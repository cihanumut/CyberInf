import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    blogService.getBlogs({ limit: 50 })
      .then(r => {
        // Kendi yazılarını filtrele
        const myBlogs = (r.data.blogs || []).filter(b => 
          b.author?._id === user.id || b.author?.id === user.id
        );
        setBlogs(myBlogs);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Emin misiniz?')) return;
    try {
      await blogService.deleteBlog(id);
      setBlogs(p => p.filter(b => b._id !== id));
      toast.success('Yazı silindi.');
    } catch { toast.error('Silinemedi.'); }
  };

  const statusBadge = (status) => {
    const map = { draft: 'badge-orange', pending: 'badge-blue', published: 'badge-green', rejected: 'badge-red' };
    const labels = { draft: 'Taslak', pending: 'Bekliyor', published: 'Yayında', rejected: 'Reddedildi' };
    return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="container page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title"><span>//</span> Dashboard</h1>
        <Link to="/posts/create" className="btn btn-primary">+ Yeni Yazı</Link>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
        Hoş geldin, <span style={{ color: 'var(--accent-green)' }}>@{user?.username}</span>
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
      ) : blogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>Henüz yazın yok.</p>
          <Link to="/posts/create" className="btn btn-primary">İlk yazını yaz</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {blogs.map(blog => (
            <div key={blog._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{blog.title}</h3>
                  {statusBadge(blog.status)}
                </div>
                {blog.status === 'rejected' && blog.rejectionReason && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>Red: {blog.rejectionReason}</p>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(blog.createdAt).toLocaleDateString('tr-TR')} · {blog.views} görüntülenme
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {blog.status === 'published' && (
                  <Link to={`/posts/${blog.slug}`} className="btn btn-secondary btn-sm">Görüntüle</Link>
                )}
                <Link to={`/posts/${blog._id}/edit`} className="btn btn-secondary btn-sm">Düzenle</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(blog._id)}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
