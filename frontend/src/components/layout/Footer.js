import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-text">[CYBERINF]</span>
          <p>Siber güvenlik topluluğu için, Cihan Umut Çolak tarafından.</p>
        </div>
        <div className="footer-links">
          <Link to="/posts">Yazılar</Link>
          <Link to="/register">Kayıt Ol</Link>
        </div>
        <div className="footer-copy">
          <span style={{ color: 'var(--accent-green)' }}>©</span> {new Date().getFullYear()} CyberInf
        </div>
      </div>
    </footer>
  );
}
