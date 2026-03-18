import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogService, commentService } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function PostDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    blogService.getBlog(slug)
      .then((r) => {
        setBlog(r.data.blog);
        setComments(r.data.comments || []);
        setLikesCount(r.data.blog.likes?.length || 0);
        if (user) setLiked(r.data.blog.likes?.includes(user.id || user._id));
      })
      .catch(() => navigate("/404"))
      .finally(() => setLoading(false));
  }, [slug, navigate, user]);

  const handleDelete = async () => {
    if (!window.confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    try {
      await blogService.deleteBlog(blog._id);
      toast.success("Yazı silindi.");
      navigate("/posts");
    } catch {
      toast.error("Silinemedi.");
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error("Beğenmek için giriş yap.");
    try {
      const { data } = await blogService.toggleLike(blog._id);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  const handleCommentLike = async (commentId, blogId) => {
    if (!isAuthenticated) return toast.error("Beğenmek için giriş yap.");
    try {
      const { data } = await commentService.toggleCommentLike(blogId, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: data.liked
                  ? [...(c.likes || []), user.id]
                  : (c.likes || []).filter((id) => id !== user.id),
                likesCount: data.likesCount,
              }
            : c,
        ),
      );
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("Yorumu silmek istiyor musunuz?")) return;
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Yorum silindi.");
    } catch {
      toast.error("Silinemedi.");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentService.createComment(blog._id, { content: commentText });
      toast.success(data.message);
      setCommentText("");
    } catch {
      toast.error("Yorum gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!blog) return null;

  const isAuthor = user?._id === blog.author?._id || user?.id === blog.author?._id;

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem", maxWidth: 860 }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {blog.category && <span className="badge badge-blue">{blog.category?.name || blog.category}</span>}
          {blog.tags?.map((t) => <span key={t} className="badge badge-green">{t}</span>)}
          <span className="badge badge-orange">{blog.readTime} dk</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontFamily: "var(--font-mono)", marginBottom: "1rem", lineHeight: 1.3 }}>
          {blog.title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
            <Link to={`/profile/${blog.author?._id}`} style={{ color: "var(--accent-green)", fontFamily: "var(--font-mono)", textDecoration: "none" }}>
              @{blog.author?.username}
            </Link>
            <span>{new Date(blog.createdAt).toLocaleDateString("tr-TR")}</span>
            <span>{blog.views} görüntülenme</span>
            <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", color: liked ? "var(--accent-red)" : "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.875rem", padding: "0.2rem 0.4rem", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>
              {liked ? "❤️" : "🤍"} {likesCount}
            </button>
          </div>
          {(isAuthor || user?.role === "admin") && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link to={`/posts/${blog._id}/edit`} className="btn btn-secondary btn-sm">Düzenle</Link>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Sil</button>
            </div>
          )}
        </div>
      </div>

      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title} style={{ width: "100%", borderRadius: "var(--radius-lg)", marginBottom: "2rem", maxHeight: 400, objectFit: "cover" }} />
      )}

      <div className="markdown-content" style={{ marginBottom: "3rem" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
      </div>

      <div>
        <h2 style={{ fontFamily: "var(--font-mono)", marginBottom: "1.5rem" }}>
          <span style={{ color: "var(--accent-green)" }}>//</span> Yorumlar ({comments.length})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleComment} style={{ marginBottom: "2rem" }}>
            <textarea className="form-input" rows={4} placeholder="Yorumunuzu yazın..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button className="btn btn-primary btn-sm" type="submit" disabled={submitting} style={{ marginTop: "0.5rem" }}>
              {submitting ? "Gönderiliyor..." : "Yorum Gönder"}
            </button>
          </form>
        ) : (
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.875rem", marginBottom: "2rem" }}>
            Yorum yapmak için <Link to="/login" style={{ color: "var(--accent-green)" }}>giriş yap</Link>.
          </p>
        )}

        {comments.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
            Henüz onaylanmış yorum yok.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {comments.map((c) => (
              <div key={c._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--accent-green)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                    @{c.author?.username}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                    <button
                      onClick={() => handleCommentLike(c._id, blog._id)}
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", color: c.likes?.includes(user?.id || user?._id) ? "var(--accent-red)" : "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", padding: "0.1rem 0.3rem", transition: "color 0.15s" }}
                    >
                      {c.likes?.includes(user?.id || user?._id) ? "❤️" : "🤍"} {c.likesCount ?? c.likes?.length ?? 0}
                    </button>
                    {(user?.id === c.author?._id || user?._id === c.author?._id || user?.role === "admin") && (
                      <button
                        onClick={() => handleCommentDelete(c._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", padding: "0.1rem 0.3rem", transition: "opacity 0.15s" }}
                      >
                        sil
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
