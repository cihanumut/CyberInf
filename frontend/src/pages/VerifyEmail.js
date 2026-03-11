import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Geçersiz doğrulama linki.');
      return;
    }

    authService.verifyEmail(token, email)
      .then(r => {
        setStatus('success');
        setMessage(r.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Doğrulama başarısız.');
      });
  }, [searchParams]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      const r = await authService.resendVerification(resendEmail);
      setResendMsg(r.data.message);
    } catch (err) {
      setResendMsg(err.response?.data?.error || 'Mail gönderilemedi.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="container page-section" style={{ maxWidth: 500, paddingTop: '4rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        {status === 'loading' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Email doğrulanıyor...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '1rem' }}>
              Email Doğrulandı!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>
            <Link to="/login" className="btn btn-primary">Giriş Yap</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-red)', marginBottom: '1rem' }}>
              Doğrulama Başarısız
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Yeni doğrulama maili gönder:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  type="email"
                  placeholder="email@adresin.com"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleResend}
                  disabled={resendLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {resendLoading ? '...' : 'Gönder'}
                </button>
              </div>
              {resendMsg && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  {resendMsg}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}