import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../utils/api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.passwordResetRequest(email);
      setSent(true);
      if (data.devToken) {
        setDevToken(data.devToken);
      }
      toast.success('Şifre sıfırlama bağlantısı gönderildi!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">[CYBERINF]</div>
            <h1 className="auth-title">Email Gönderildi</h1>
            <p className="auth-subtitle">// Şifre sıfırlama bağlantısı gönderildi</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--accent-green)' }}>{email}</span> adresine şifre sıfırlama bağlantısı gönderildi.
          </p>

          {/* DEV ONLY - production'da kaldır */}
          {devToken && (
            <div style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--accent-orange)',
              borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem'
            }}>
              <p style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                [DEV] Şifre sıfırlama token:
              </p>
              <Link
                to={`/reset-password?token=${devToken}&email=${email}`}
                style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', wordBreak: 'break-all' }}
              >
                Şifremi Sıfırla →
              </Link>
            </div>
          )}

          <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">[CYBERINF]</div>
          <h1 className="auth-title">Şifremi Unuttum</h1>
          <p className="auth-subtitle">// Email adresine sıfırlama linki gönderilecek</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="kullanici@ornek.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Gönderiliyor...' : '> Sıfırlama Linki Gönder'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">← Giriş sayfasına dön</Link>
        </p>
      </div>
    </div>
  );
}