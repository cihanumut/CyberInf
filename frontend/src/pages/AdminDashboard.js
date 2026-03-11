import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { blogService, commentService } from '../utils/api';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AdminDashboard.css';

function AdminStats({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: 'Yayınlanan Yazı', value: stats.posts?.published, color: 'green' },
    { label: 'Onay Bekleyen Yazı', value: stats.posts?.pending, color: 'orange', urgent: stats.posts?.pending > 0 },
    { label: 'Bekleyen Yorum', value: stats.comments?.pending, color: 'purple', urgent: stats.comments?.pending > 0 }
  ];
  return (
    <div className="stats-grid">
      {cards.map(c => (
        <div key={c.label} className={`stat-card ${c.urgent ? 'urgent' : ''}`}>
          <div className={`stat-value color-${c.color}`}>{c.value ?? '—'}</div>
          <div className="stat-label">{c.label}</div>
          {c.urgent && <div className="urgent-badge">!</div>}
        </div>
      ))}
    </div>
  );
}

function PendingPostCard({ post, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const [fullContent, setFullContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleExpand = async () => {
    if (!expanded && !fullContent) {
      setLoadingContent(true);
      try {
        const r = await blogService.getBlog(post._id);
        setFullContent(r.data.blog.content);
      } catch {
        setFullContent(post.excerpt || 'İçerik yüklenemedi.');
      } finally {
        setLoadingContent(false);
      }
    }
    setExpanded(p => !p);
  };

  return (
    <div className="review-card">
      {/* Başlık & Meta */}
      <div className="review-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="review-title">{post.title}</h3>
          <div className="review-meta">
            <span>@{post.author?.username}</span>
            <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
            {post.category && <span className="badge badge-blue">{post.category?.name || post.category}</span>}
            {post.tags?.slice(0, 3).map(t => <span key={t} className="badge badge-green">{t}</span>)}
          </div>
        </div>
        <div className="review-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExpand}
          >
            {expanded ? '▲ Daralt' : '▼ İçeriği Gör'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onReview(post._id, 'approve')}>
            ✓ Onayla
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setRejectOpen(p => !p)}>
            ✗ Reddet
          </button>
        </div>
      </div>

      {/* Tam İçerik */}
      {expanded && (
        <div style={{
          marginTop: '1rem',
          padding: '1.25rem',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
          )}
          {loadingContent ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {fullContent || ''}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Red Formu */}
      {rejectOpen && (
        <div className="reject-form">
          <textarea
            className="form-input"
            placeholder="Red sebebini yazın (opsiyonel)..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-danger btn-sm" onClick={() => { onReview(post._id, 'reject', reason); setRejectOpen(false); }}>
              Reddet
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setRejectOpen(false)}>
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blogs?status=pending&limit=50')
      .then(r => setPosts(r.data.blogs || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (id, action, rejectionReason) => {
    try {
      const status = action === 'approve' ? 'published' : 'rejected';
      await blogService.updateBlog(id, { status, rejectionReason: rejectionReason || null });
      setPosts(p => p.filter(post => post._id !== id));
      toast.success(action === 'approve' ? 'Yazı yayınlandı!' : 'Yazı reddedildi.');
    } catch {
      toast.error('İşlem başarısız.');
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '2rem auto' }} />;

  return (
    <div>
      <h2 className="section-title">
        Onay Bekleyen Yazılar <span className="count">{posts.length}</span>
      </h2>
      {posts.length === 0 ? (
        <div className="empty-state">✓ Bekleyen yazı yok</div>
      ) : (
        <div className="review-list">
          {posts.map(post => (
            <PendingPostCard key={post._id} post={post} onReview={handleReview} />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commentService.getComments({ status: 'pending', limit: 50 })
      .then(r => setComments(r.data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, []);

  const review = async (id, action) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      await commentService.updateComment(id, { status });
      setComments(c => c.filter(x => x._id !== id));
      toast.success(action === 'approve' ? 'Yorum onaylandı!' : 'Yorum reddedildi.');
    } catch {
      toast.error('İşlem başarısız.');
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '2rem auto' }} />;

  return (
    <div>
      <h2 className="section-title">
        Onay Bekleyen Yorumlar <span className="count">{comments.length}</span>
      </h2>
      {comments.length === 0 ? (
        <div className="empty-state">✓ Bekleyen yorum yok</div>
      ) : (
        <div className="review-list">
          {comments.map(c => (
            <div key={c._id} className="review-card">
              <div className="review-card-header">
                <div>
                  <div className="review-meta">
                    <strong>@{c.author?.username}</strong>
                    <span>→ <span className="post-link">{c.post?.title}</span></span>
                  </div>
                  <p className="comment-content">"{c.content}"</p>
                </div>
                <div className="review-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => review(c._id, 'approve')}>✓ Onayla</button>
                  <button className="btn btn-danger btn-sm" onClick={() => review(c._id, 'reject')}>✗ Reddet</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: { published: 0, pending: 0 }, comments: { pending: 0 } });
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      api.get('/blogs?status=pending&limit=1').catch(() => ({ data: { pagination: { totalBlogs: 0 } } })),
      commentService.getComments({ status: 'pending', limit: 1 }).catch(() => ({ data: { pagination: { totalComments: 0 } } })),
      api.get('/blogs?limit=1').catch(() => ({ data: { pagination: { totalBlogs: 0 } } })),
    ]).then(([pending, pendingComments, published]) => {
      setStats({
        posts: {
          pending: pending.data?.pagination?.totalBlogs || 0,
          published: published.data?.pagination?.totalBlogs || 0,
        },
        comments: {
          pending: pendingComments.data?.pagination?.totalComments || 0
        }
      });
    });
  }, []);

  const navItems = [
    { path: '/admin', label: 'Genel Bakış' },
    { path: '/admin/posts', label: `Yazılar ${stats?.posts?.pending > 0 ? `(${stats.posts.pending})` : ''}` },
    { path: '/admin/comments', label: `Yorumlar ${stats?.comments?.pending > 0 ? `(${stats.comments.pending})` : ''}` },
  ];

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-title">
              <span style={{ color: 'var(--accent-purple)' }}>[ADMIN]</span>
            </div>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </aside>

          <div className="admin-content">
            <Routes>
              <Route path="/" element={
                <div>
                  <h1 className="page-title"><span>//</span> Admin Panel</h1>
                  <AdminStats stats={stats} />
                </div>
              } />
              <Route path="/posts" element={<PendingPosts />} />
              <Route path="/comments" element={<PendingComments />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
