import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../utils/api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Şifreler eşleşmiyor.');
    }
    if (newPassword.length < 6) {
      return toast.error('Şifre en az 6 karakter olmalı.');
    }
    setLoading(true);
    try {
      await authService.passwordResetConfirm({ token, email, newPassword });
      toast.success('Şifreniz güncellendi! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Token geçersiz veya süresi dolmuş.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">[CYBERINF]</div>
            <h1 className="auth-title">Geçersiz Link</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
            Bu şifre sıfırlama linki geçersiz.
          </p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Yeni Link İste
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
          <h1 className="auth-title">Yeni Şifre</h1>
          <p className="auth-subtitle">// Yeni şifrenizi belirleyin</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Yeni Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="En az 6 karakter"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre Tekrar</label>
            <input
              type="password"
              className="form-input"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Güncelleniyor...' : '> Şifremi Güncelle'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">← Giriş sayfasına dön</Link>
        </p>
      </div>
    </div>
  );
}