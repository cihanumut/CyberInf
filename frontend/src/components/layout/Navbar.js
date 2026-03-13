import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../utils/api";
import toast from "react-hot-toast";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationService.getNotifications()
      .then((r) => {
        setNotifications(r.data.notifications || []);
        setUnreadCount(r.data.unreadCount || 0);
      })
      .catch(() => {});
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Çıkış yapıldı.");
    navigate("/");
    setMobileOpen(false);
    setMenuOpen(false);
  };

  const handleNotifOpen = async () => {
    setNotifOpen((p) => !p);
    if (!notifOpen && unreadCount > 0) {
      await notificationService.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const getNotifIcon = (type) => {
    const icons = { post_approved: "✅", post_rejected: "❌", new_follower: "👤", following_new_post: "📝" };
    return icons[type] || "🔔";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-bracket">[</span>
            <span className="brand-text">CYBER</span>
            <span className="brand-accent">INF</span>
            <span className="brand-bracket">]</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links">
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              <span className="prompt">&gt;</span> Anasayfa
            </Link>
            <Link to="/posts" className={`nav-link ${isActive("/posts") ? "active" : ""}`}>
              <span className="prompt">&gt;</span> Yazılar
            </Link>
            {isAdmin && (
              <Link to="/admin" className={`nav-link nav-admin ${location.pathname.startsWith("/admin") ? "active" : ""}`}>
                <span className="prompt">&gt;</span> Admin
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <Link to="/posts/create" className="btn btn-primary btn-sm">+ Yeni Yazı</Link>

                <div className="notif-wrapper" ref={notifRef}>
                  <button className="notif-btn" onClick={handleNotifOpen}>
                    🔔
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <span>Bildirimler</span>
                        {notifications.length > 0 && (
                          <button className="notif-clear" onClick={async () => {
                            await notificationService.markAllRead();
                            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                            setUnreadCount(0);
                          }}>Tümünü okundu say</button>
                        )}
                      </div>
                      <div className="notif-list">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">Bildirim yok</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className={`notif-item ${!n.isRead ? "unread" : ""}`}
                              onClick={() => {
                                if (n.type === "new_follower" && n.sender?._id) navigate(`/profile/${n.sender._id}`);
                                else if (n.post?.slug) navigate(`/posts/${n.post.slug}`);
                                setNotifOpen(false);
                              }}>
                              <span className="notif-icon">{getNotifIcon(n.type)}</span>
                              <div className="notif-content">
                                <p className="notif-message">{n.message}</p>
                                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString("tr-TR")}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="user-menu">
                  <button className="user-button" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="user-avatar">
                      {user?.avatar ? <img src={user.avatar} alt={user.username} /> : <span>{user?.username?.[0]?.toUpperCase()}</span>}
                    </div>
                    <span className="user-name">{user?.username}</span>
                    <span className="chevron">{menuOpen ? "▲" : "▼"}</span>
                  </button>
                  {menuOpen && (
                    <div className="dropdown-menu">
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                      <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>Profil</Link>
                      {isAdmin && <Link to="/admin" className="dropdown-item" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                      <hr className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={handleLogout}>Çıkış Yap</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Giriş</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Kayıt Ol</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className={`hamburger ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            <span className="prompt">&gt;</span> Anasayfa
          </Link>
          <Link to="/posts" className={`nav-link ${isActive("/posts") ? "active" : ""}`}>
            <span className="prompt">&gt;</span> Yazılar
          </Link>
          {isAdmin && (
            <Link to="/admin" className={`nav-link nav-admin`}>
              <span className="prompt">&gt;</span> Admin
            </Link>
          )}

          <hr className="mobile-divider" />

          {isAuthenticated ? (
            <>
              <div className="mobile-user">
                <div className="user-avatar">
                  {user?.avatar ? <img src={user.avatar} alt={user.username} /> : <span>{user?.username?.[0]?.toUpperCase()}</span>}
                </div>
                @{user?.username}
              </div>
              <Link to="/posts/create" className="btn btn-primary">+ Yeni Yazı</Link>
              <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
              <Link to="/profile" className="btn btn-secondary">Profil</Link>
              <button className="btn btn-secondary" style={{ color: 'var(--accent-red)' }} onClick={handleLogout}>Çıkış Yap</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Giriş Yap</Link>
              <Link to="/register" className="btn btn-primary">Kayıt Ol</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
