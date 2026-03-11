import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../utils/api';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getBlogs({ limit: 6, sort: '-createdAt' })
      .then(r => setBlogs(r.data.blogs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page-section" style={{ paddingTop: '4rem' }}>
      {/* Hero */}
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '1rem', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
          $ ./cybersec-blog --start
        </div>
        <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
          Siber Güvenlik<br/><span>Bilgi Merkezi</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          Web güvenliği, ağ saldırıları, CTF çözümleri ve daha fazlası.
          Topluluğun bilgi birikimini keşfet veya kendin katkıda bulun.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/posts" className="btn btn-primary btn-lg">Yazıları Gör</Link>
          <Link to="/register" className="btn btn-secondary btn-lg">Katıl</Link>
        </div>
      </div>

      {/* Son Yazılar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>
            <span style={{ color: 'var(--accent-green)' }}>//</span> Son Yazılar
          </h2>
          <Link to="/posts" style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'none' }}>
            Tümünü gör →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
            Henüz yayınlanmış yazı yok.
          </div>
        ) : (
          <div className="grid-3">
            {blogs.map(blog => (
              <Link key={blog._id} to={`/posts/${blog.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', transition: 'border-color 0.2s' }}>
                  {blog.coverImage && (
                    <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {blog.category && <span className="badge badge-blue">{blog.category?.name || blog.category}</span>}
                    {blog.tags?.slice(0, 2).map(t => <span key={t} className="badge badge-green">{t}</span>)}
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {blog.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 'auto' }}>
                    <Link to={`/profile/${blog.author?._id}`} style={{ color: 'var(--accent-green)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                      @{blog.author?.username}
                    </Link>
                    <span>{blog.readTime} dk · {blog.likes?.length || 0} ❤️</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}