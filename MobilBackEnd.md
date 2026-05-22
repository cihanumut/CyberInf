# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** [api.cyberinf.com](https://cyberinf.onrender.com/api/health)

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Cihan Umut Çolak'ın Mobil Backend Görevleri](Cihan-Umut-Çolak/Cihan-Umut-Çolak-Mobil-Backend-Gorevleri.md)

---

# CyberInf Mobil Backend Teknik Dokümantasyonu

## Bölüm 1: Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
- **Base URL:** `https://cyberinf.onrender.com/health`
- **Timeout:** Request timeout 30 saniye, connect timeout 10 saniye.
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (Giriş yapılmış her istekte zorunlu).
- **Client:** `Axios` tabanlı merkezi servis yönetimi.

### 2. Authentication Yönetimi
- JWT (Access Token) verilerini `AsyncStorage` üzerinde persist etme.
- Axios Interceptors ile 401 (Unauthorized) durumunda otomatik logout.
- Uygulama açılışında `AuthContext` üzerinden token geçerlilik kontrolü.
- Logout sırasında yerel depolamanın tamamen temizlenmesi.

### 3. Error Handling (Hata Yönetimi)
- Network hataları için merkezi bir `catch` bloğu üzerinden kullanıcı bilgilendirme.
- `AlertContext` kullanılarak HTTP status kodlarına göre özelleştirilmiş mesajlar.
- Kritik işlemler için hata durumunda "Tekrar Dene" (Retry) mekanizması.
- İnternet yoksa kullanıcıyı "Çevrimdışı Mod" konusunda uyarma.

### 4. Caching ve Veri Senkronizasyonu
- **GET İstekleri:** Blog listeleri ve profil verileri için yerel caching.
- **Cache Invalidation:** Profil güncelleme, yazı silme veya yeni yazı ekleme sonrası backend'deki Redis önbelleğinin temizlenmesi (`flushAll`).
- **Focus Refreshing:** `useFocusEffect` ile sayfa her odağa geldiğinde verinin tazeliğini kontrol etme.

### 5. Loading ve Kullanıcı Deneyimi (UX)
- Tüm asenkron isteklerde (API calls) `ActivityIndicator` gösterimi.
- Başarılı/Başarısız işlemler için haptic feedback ve Toast/Alert bildirimleri.
- **Optimistic Updates:** Beğeni ve takip gibi işlemlerde sunucu cevabı beklemeden UI güncelleme.

### 6. Logging ve Debugging
- Geliştirme modunda `console.log` ile API request/response takibi.
- Backend tarafında tüm mobil aktivitelerin RabbitMQ üzerinden loglanması.
- Axios Interceptor ile ağ trafiği izleme.

---

## Bölüm 2: Mobil Backend Entegrasyon Görevleri

## 1. Kullanıcı Kayıt Servisi
- **API Endpoint:** `POST /auth/register`
- **Görev:** Yeni kullanıcıların CyberInf ekosistemine dahil edilmesi.
- **İşlevler:**
  - Username, email ve password verilerinin toplanması.
  - Kayıt sonrası "Email doğrulama" uyarısının tetiklenmesi.
- **Teknik Detaylar:**
  - Backend validation (400/409) hatalarının parse edilmesi.
  - Form validasyonu (Şifre min 6 karakter vb.).

## 2. Güvenli Giriş Servisi
- **API Endpoint:** `POST /auth/login`
- **Görev:** JWT tabanlı kimlik doğrulama ve oturum persistence.
- **İşlevler:**
  - Token'ın alınması ve yerel depolamaya kaydedilmesi.
  - Başarılı giriş sonrası `AuthContext` üzerinden kullanıcı state'inin güncellenmesi.
- **Teknik Detaylar:**
  - Bearer token yapısının interceptor'lara tanıtılması.

## 3. Dinamik Blog Akışı (Feed) Servisi
- **API Endpoint:** `GET /blogs`
- **Görev:** Ana sayfa akışının performanslı listelenmesi.
- **İşlevler:**
  - Yayınlanmış yazıların kategorilere göre çekilmesi.
  - Pull-to-refresh ile anlık veri yenileme.
- **Teknik Detaylar:**
  - Redis cache uyumlu istek yönetimi.
  - Sayfalama (Pagination) parametreleri.

## 4. Yazı Detay ve Yorum Çekme Servisi
- **API Endpoint:** `GET /blogs/:id`
- **Görev:** Yazı içeriğinin ve sosyal etkileşimlerin gösterilmesi.
- **İşlevler:**
  - Markdown verisinin çekilmesi.
  - Onaylanmış yorumların hiyerarşik listelenmesi.
- **Teknik Detaylar:**
  - İzlenme sayısının (views) otomatik artırımı.

## 5. Medya Yükleme Servisi
- **API Endpoint:** `POST /upload/image`
- **Görev:** Görsel içeriklerin sunucuya güvenli transferi.
- **İşlevler:**
  - Resimlerin `FormData` olarak yüklenmesi.
  - Dönen görsel URL'sinin yazılara veya profile bağlanması.
- **Teknik Detaylar:**
  - Resim sıkıştırma (Client-side compression).

## 6. Blog Yazısı Oluşturma ve Düzenleme
- **API Endpoint:** `POST /blogs`, `PUT /blogs/:id`
- **Görev:** Kullanıcı içeriklerinin yönetimi.
- **İşlevler:**
  - Başlık, içerik ve kapak fotoğrafının sunucuya iletilmesi.
  - Yazı statüsü (Taslak/Yayın) yönetimi.
- **Teknik Detaylar:**
  - Zengin metin (Markdown) senkronizasyonu.

## 7. Sosyal Etkileşim: Beğeni Servisi
- **API Endpoint:** `POST /blogs/:id/like`
- **Görev:** Yazıların topluluk tarafından oylanması.
- **İşlevler:**
  - Beğenme ve beğeniyi geri çekme.
  - Anlık sayaç güncelleme.
- **Teknik Detaylar:**
  - Haptic feedback tetikleyicisi.

## 8. Takip ve Sosyal Ağ Servisi
- **API Endpoint:** `POST /users/:id/follow`
- **Görev:** Kullanıcılar arası takip ilişkisi kurma.
- **İşlevler:**
  - Takip et/bırak işlemleri.
  - Profil ekranında takipçi sayılarının güncellenmesi.
- **Teknik Detaylar:**
  - Sosyal bildirimlerin backend üzerinde tetiklenmesi.

## 9. Bildirim Merkezi Servisi
- **API Endpoint:** `GET /notifications`
- **Görev:** Sosyal uyarıların listelenmesi.
- **İşlevler:**
  - Beğeni, takip ve yorum bildirimlerinin çekilmesi.
  - Badge sayısının yönetimi.
- **Teknik Detaylar:**
  - Bildirim üzerinden yazıya/profile otomatik yönlendirme (Deep Link).

## 10. Profil Düzenleme ve Yönetim
- **API Endpoint:** `PUT /users/:id`
- **Görev:** Kullanıcı bilgilerinin güncellenmesi.
- **İşlevler:**
  - Avatar, kullanıcı adı ve biyografi değişikliği.
- **Teknik Detaylar:**
  - Güncelleme sonrası Redis cache invalidation (`flushAll`).

## 11. Global Arama ve Filtreleme
- **API Endpoint:** `GET /search`
- **Görev:** İçerik ve kullanıcı keşfi.
- **İşlevler:**
  - `Debounce` destekli dinamik arama.
  - Yazı ve Kullanıcı sonuçlarının ayrıştırılması.
- **Teknik Detaylar:**
  - Query parameter tabanlı servis isteği.

## 12. Hesap Silme Servisi
- **API Endpoint:** `DELETE /users/:userId`
- **Görev:** Kullanıcı hesabının kalıcı olarak silinmesi.
- **İşlevler:**
  - Çift onay sonrası tüm verilerin imha edilmesi.
  - Oturumun tamamen kapatılması.
- **Teknik Detaylar:**
  - Başarılı silme sonrası `AsyncStorage` temizliği.

## 13. Admin Moderasyon Servisleri
- **API Endpoint:** `/admin/*`
- **Görev:** Platform güvenliği ve içerik denetimi.
- **İşlevler:**
  - Yazı onaylama/reddetme.
  - Uygunsuz içeriklerin kaldırılması.
- **Teknik Detaylar:**
  - Role-based access control (RBAC) kontrolü.

