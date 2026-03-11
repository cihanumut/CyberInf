// NotFound.js
import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--accent-red)', marginBottom: '1rem' }}>ERROR 404</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>:/</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Aradığın sayfa bulunamadı.</p>
      <Link to="/" className="btn btn-primary">Anasayfaya Dön</Link>
    </div>
  );
}
