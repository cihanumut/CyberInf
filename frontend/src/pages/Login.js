import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../utils/api";
import toast from "react-hot-toast";
import "./Auth.css";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotVerified(false);
    try {
      await login(form);
      toast.success("Hoş geldin!");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.emailNotVerified) {
        setNotVerified(true);
      } else {
        toast.error(err.response?.data?.error || "Giriş başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification(form.email);
      toast.success("Doğrulama maili tekrar gönderildi!");
    } catch (err) {
      toast.error("Mail gönderilemedi.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">[CYBERSEC]</div>
          <h1 className="auth-title">Giriş Yap</h1>
          <p className="auth-subtitle">// Hesabına güvenli bağlan</p>
        </div>

        {notVerified && (
          <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              ⚠️ Email adresiniz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.
            </p>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? '...' : 'Doğrulama mailini tekrar gönder'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="kullanici@ornek.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <p style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "1rem" }}>
            <Link to="/forgot-password" style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              Şifremi unuttum
            </Link>
          </p>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "> Giriş Yap"}
          </button>
        </form>

        <p className="auth-footer">
          Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(form);
      setSuccess(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length) {
        toast.error(errors[0].msg);
      } else {
        toast.error(err.response?.data?.error || "Kayıt başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '1rem' }}>
            Hesabın Oluşturuldu!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong> adresine doğrulama maili gönderildi.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Linke tıklayarak hesabını aktifleştir, ardından giriş yapabilirsin.
          </p>
          <Link to="/login" className="btn btn-primary">Giriş Sayfasına Git</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">[CYBERSEC]</div>
          <h1 className="auth-title">Kayıt Ol</h1>
          <p className="auth-subtitle">// Topluluğa katıl</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kullanıcı Adı</label>
            <input
              type="text"
              className="form-input"
              placeholder="h4ck3r_nick"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              required
              minLength={3}
              maxLength={30}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="kullanici@ornek.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="En az 6 karakter"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Kaydediliyor..." : "> Kayıt Ol"}
          </button>
        </form>

        <p className="auth-footer">
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;