import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../utils/api';
import toast from 'react-hot-toast';

export function Profile() {
  const { userId } = useParams();
  const { user, updateUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const viewingOwnProfile = !userId || userId === (user?.id || user?._id);

  useEffect(() => {
    if (viewingOwnProfile) {
      setForm({ username: user?.username || '', bio: user?.bio || '' });
    } else {
      userService.getUser(userId)
        .then(r => {
          setProfileUser(r.data.user);
          setFollowing(r.data.user.isFollowing || false);
        })
        .catch(() => toast.error('Kullanıcı bulunamadı.'));
    }
  }, [userId, user, viewingOwnProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userService.updateUser(user.id || user._id, form);
      updateUser(data.user);
      toast.success('Profil güncellendi!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) return toast.error('Takip etmek için giriş yap.');
    setFollowLoading(true);
    try {
      const { data } = await userService.toggleFollow(userId);
      setFollowing(data.following);
      setProfileUser(prev => ({
        ...prev,
        followersCount: data.following
          ? (prev.followersCount || 0) + 1
          : (prev.followersCount || 1) - 1
      }));
      toast.success(data.message);
    } catch (err) {
      toast.error('İşlem başarısız.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Başka kullanıcının profili
  if (!viewingOwnProfile) {
    if (!profileUser) return <div className="loading-screen"><div className="spinner" /></div>;
    return (
      <div className="container page-section" style={{ maxWidth: 600 }}>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--accent-green)', color: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, margin: '0 auto 1rem'
          }}>
            {profileUser.avatar
              ? <img src={profileUser.avatar} alt={profileUser.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : profileUser.username?.[0]?.toUpperCase()
            }
          </div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            @{profileUser.username}
          </h1>
          {profileUser.bio && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {profileUser.bio}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: 'var(--accent-green)' }}>{profileUser.followersCount || 0}</strong> takipçi</span>
            <span><strong style={{ color: 'var(--accent-green)' }}>{profileUser.followingCount || 0}</strong> takip</span>
          </div>
          {isAuthenticated && (
            <button
              className={`btn ${following ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? '...' : following ? 'Takibi Bırak' : '+ Takip Et'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Kendi profili
  return (
    <div className="container page-section" style={{ maxWidth: 600 }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}><span>//</span> Profil</h1>

      {/* Takipçi istatistikleri */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: 'var(--accent-green)' }}>
            {user?.followersCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Takipçi</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: 'var(--accent-green)' }}>
            {user?.followingCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Takip</div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kullanıcı Adı</label>
            <input className="form-input" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-input" rows={4} value={form.bio} placeholder="Kendin hakkında birkaç kelime..." onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Rol</label>
            <input className="form-input" value={user?.role || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;