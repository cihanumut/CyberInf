# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [frontend.cyberinf.com](https://www.cyberinf.com.tr/)

---

## 🔐 Authentication İşlemleri

### 1. Üye Olma (Kayıt) Sayfası
- **API Endpoint:** `POST /auth/register`
- **Görev:** Kullanıcı kayıt işlemi için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Kullanıcı adı input (min 3, max 30 karakter)
  - Email input (type="email")
  - Şifre input (type="password", min 6 karakter)
  - "Kayıt Ol" butonu (primary)
  - "Zaten hesabın var mı? Giriş Yap" linki
  - Loading spinner
  - Başarılı kayıt sonrası email doğrulama ekranı
- **Form Validasyonu:**
  - Kullanıcı adı 3-30 karakter
  - Email format kontrolü
  - Şifre min 6 karakter
  - Tüm alanlar dolu olmadan buton disabled
- **Kullanıcı Deneyimi:**
  - Başarılı kayıt sonrası "Hesabınız oluşturuldu, emailinizi doğrulayın" ekranı
  - Hata mesajları: "Bu email zaten kullanılıyor", "Bu kullanıcı adı zaten kullanılıyor"
  - Double-click koruması (loading state)
- **Teknik Detaylar:**
  - Framework: React
  - State: form, loading, success
  - Routing: `/register` → email doğrulama ekranı → `/login`

---

### 2. Giriş Yapma Sayfası
- **API Endpoint:** `POST /auth/login`
- **Görev:** Kullanıcı giriş işlemi için web sayfası
- **UI Bileşenleri:**
  - Email input
  - Şifre input
  - "Şifremi unuttum" linki
  - "Giriş Yap" butonu
  - "Hesabın yok mu? Kayıt Ol" linki
  - Loading spinner
  - Email doğrulanmamışsa uyarı + "Tekrar gönder" butonu
- **Kullanıcı Deneyimi:**
  - Başarılı girişte anasayfaya yönlendirme
  - Email doğrulanmamışsa kırmızı uyarı kutusu gösterilir
  - Yanlış şifre/email: "Email veya şifre hatalı" mesajı
- **Teknik Detaylar:**
  - Framework: React
  - State: form, loading, notVerified, resendLoading
  - localStorage: `accessToken`, `refreshToken` kaydedilir
  - Routing: `/login` → `/`

---

### 3. Çıkış Yapma
- **API Endpoint:** `POST /auth/logout`
- **Görev:** Navbar'daki dropdown menüden çıkış işlemi
- **UI Bileşenleri:**
  - Navbar dropdown içinde "Çıkış Yap" butonu (danger style)
  - Mobile menüde "Çıkış Yap" butonu
- **Kullanıcı Deneyimi:**
  - Çıkış sonrası "Çıkış yapıldı" toast mesajı
  - Anasayfaya yönlendirme
  - Navbar giriş/kayıt butonlarına döner
- **Teknik Detaylar:**
  - AuthContext: logout fonksiyonu
  - localStorage temizlenir
  - Routing: `/`

---

### 4. Mevcut Kullanıcı Bilgisi
- **API Endpoint:** `GET /auth/me`
- **Görev:** Sayfa yenilendiğinde kullanıcı oturumunu sürdürme
- **UI Bileşenleri:**
  - Loading screen (uygulama ilk açıldığında)
  - Spinner
- **Kullanıcı Deneyimi:**
  - Sayfa yenilenince otomatik giriş durumu korunur
  - Token geçersizse login sayfasına yönlendirilir
- **Teknik Detaylar:**
  - AuthContext içinde uygulama başlarken çağrılır
  - State: user, isAuthenticated, loading

---

### 5. Token Yenileme
- **API Endpoint:** `POST /auth/refresh-token`
- **Görev:** Access token süresi dolduğunda otomatik yenileme
- **UI Bileşenleri:**
  - Görünür UI yok (arka planda çalışır)
- **Kullanıcı Deneyimi:**
  - Kullanıcı fark etmeden token yenilenir
  - Yenileme başarısız olursa `/login`'e yönlendirilir
- **Teknik Detaylar:**
  - `api.js` axios interceptor içinde otomatik çalışır
  - 401 response gelince refresh token ile yeni token alınır

---

### 6. Email Doğrulama Sayfası
- **API Endpoint:** `GET /auth/verify-email?token=xxx&email=xxx`
- **Görev:** Email linki tıklandığında hesabı doğrulama
- **UI Bileşenleri:**
  - Loading spinner (doğrulama sırasında)
  - Başarı mesajı + "Giriş Yap" butonu
  - Hata mesajı + "Tekrar Gönder" butonu
- **Kullanıcı Deneyimi:**
  - Link tıklandığında otomatik doğrulama yapılır
  - Başarılıysa yeşil onay mesajı
  - Hatalıysa kırmızı hata mesajı
- **Teknik Detaylar:**
  - Routing: `/verify-email?token=xxx&email=xxx`
  - URL parametrelerinden token ve email alınır

---

### 7. Doğrulama Maili Tekrar Gönder
- **API Endpoint:** `POST /auth/resend-verification`
- **Görev:** Giriş sayfasında email doğrulanmamış kullanıcıya mail tekrar gönderme
- **UI Bileşenleri:**
  - Giriş sayfasındaki uyarı kutusunda "Doğrulama mailini tekrar gönder" butonu
  - Loading state ("...")
- **Kullanıcı Deneyimi:**
  - Başarılıysa "Doğrulama maili tekrar gönderildi!" toast
  - Hatalıysa "Mail gönderilemedi" toast
- **Teknik Detaylar:**
  - Login sayfası içinde notVerified state ile kontrol edilir

---

### 8. Şifre Sıfırlama İsteği Sayfası
- **API Endpoint:** `POST /auth/password-reset`
- **Görev:** Kullanıcının email adresine şifre sıfırlama linki gönderme
- **UI Bileşenleri:**
  - Email input
  - "Sıfırlama Linki Gönder" butonu
  - "Giriş Yap" geri linki
  - Loading spinner
  - Başarı mesajı
- **Kullanıcı Deneyimi:**
  - Başarı/hata durumunda aynı mesaj gösterilir (güvenlik)
  - Loading state sırasında buton disabled
- **Teknik Detaylar:**
  - Routing: `/forgot-password`
  - GuestRoute koruması

---

### 9. Şifre Sıfırlama Onay Sayfası
- **API Endpoint:** `POST /auth/password-reset/confirm`
- **Görev:** Token ile yeni şifre belirleme sayfası
- **UI Bileşenleri:**
  - Yeni şifre input
  - Şifre tekrar input
  - "Şifremi Sıfırla" butonu
  - Loading spinner
- **Form Validasyonu:**
  - Şifre min 6 karakter
  - Şifreler eşleşmeli
- **Kullanıcı Deneyimi:**
  - Başarılıysa "Şifreniz güncellendi" toast + `/login`'e yönlendirme
  - URL'den token ve email otomatik alınır
- **Teknik Detaylar:**
  - Routing: `/reset-password?token=xxx&email=xxx`
  - GuestRoute koruması

---

## 👤 Kullanıcı İşlemleri

### 10. Kullanıcı Profil Görüntüleme Sayfası
- **API Endpoint:** `GET /users/{userId}`
- **Görev:** Başka kullanıcının profil bilgilerini görüntüleme
- **UI Bileşenleri:**
  - Circular avatar (profil resmi veya baş harf)
  - Kullanıcı adı (@username)
  - Bio alanı
  - Takipçi / Takip sayıları
  - "Takip Et / Takibi Bırak" butonu
- **Kullanıcı Deneyimi:**
  - Loading spinner
  - Kullanıcı bulunamazsa hata toast
  - Takip sonrası sayı anlık güncellenir
  - Giriş yapmamış kullanıcı takip etmeye çalışırsa "giriş yap" toast
- **Teknik Detaylar:**
  - Routing: `/profile/:userId`
  - State: profileUser, following, followLoading

---

### 11. Profil Düzenleme Sayfası
- **API Endpoint:** `PUT /users/{userId}`
- **Görev:** Kendi profil bilgilerini düzenleme
- **UI Bileşenleri:**
  - Kullanıcı adı input (mevcut değerle dolu)
  - Bio textarea (mevcut değerle dolu)
  - Email input (disabled)
  - Rol input (disabled)
  - Takipçi / Takip istatistik kartları
  - "Kaydet" butonu
- **Kullanıcı Deneyimi:**
  - Başarılıysa "Profil güncellendi!" toast
  - AuthContext güncellenir, navbar anlık değişir
  - Hata durumunda error toast
- **Teknik Detaylar:**
  - Routing: `/profile` (kendi profili)
  - State: form, loading
  - AuthContext updateUser ile global state güncellenir

---

### 12. Hesap Silme
- **API Endpoint:** `DELETE /users/{userId}`
- **Görev:** Kullanıcı hesabını silme
- **UI Bileşenleri:**
  - `window.confirm()` onay dialogu
  - Profil sayfasında "Hesabı Sil" butonu (danger style)
- **Kullanıcı Deneyimi:**
  - Onay sonrası silme işlemi
  - Başarılıysa logout + `/login`'e yönlendirme
  - Hata durumunda error toast
- **Teknik Detaylar:**
  - localStorage temizlenir
  - AuthContext logout çağrılır

---

### 13. Kullanıcı Yazıları
- **API Endpoint:** `GET /users/{userId}/blogs`
- **Görev:** Kullanıcının yazdığı blogları profil sayfasında listeleme
- **UI Bileşenleri:**
  - Blog kartları listesi
  - Loading spinner
  - "Yazı yok" empty state
- **Teknik Detaylar:**
  - Dashboard sayfasında kendi yazıları için kullanılır

---

### 14. Takip Et / Takibi Bırak
- **API Endpoint:** `POST /users/{userId}/follow`
- **Görev:** Başka kullanıcıyı takip etme/bırakma
- **UI Bileşenleri:**
  - "Takip Et" butonu (primary) / "Takibi Bırak" butonu (secondary)
  - Loading state ("...")
- **Kullanıcı Deneyimi:**
  - Takipçi sayısı anlık güncellenir
  - Başarı toast mesajı
- **Teknik Detaylar:**
  - Toggle işlemi — tek endpoint hem takip hem bırak
  - State: following, followLoading

---

## 📝 Blog İşlemleri

### 15. Blog Yazıları Listesi Sayfası
- **API Endpoint:** `GET /blogs`
- **Görev:** Tüm yayınlanmış yazıları listeleme ve filtreleme
- **UI Bileşenleri:**
  - Arama input (Enter ile arama)
  - Kategori filtreleme butonları
  - Blog kartları (3 sütun grid, mobilde 1 sütun)
  - Sayfalama butonları
  - Loading spinner
  - "Yazı bulunamadı" empty state
- **Kullanıcı Deneyimi:**
  - Kategori seçimi URL parametresiyle korunur
  - Sayfa değişince scroll yukarı gider
- **Teknik Detaylar:**
  - Routing: `/posts`
  - useSearchParams ile URL tabanlı filtreleme
  - State: blogs, categories, pagination, loading

---

### 16. Blog Detay Sayfası
- **API Endpoint:** `GET /blogs/{blogId}`
- **Görev:** Tek bir blog yazısını okuma sayfası
- **UI Bileşenleri:**
  - Kategori ve tag badgeleri
  - Başlık (H1)
  - Yazar linki, tarih, görüntülenme sayısı
  - Beğeni butonu (❤️/🤍 + sayı)
  - Düzenle/Sil butonları (yazar veya admin için)
  - Kapak resmi
  - Markdown içerik
  - Yorum formu
  - Yorumlar listesi
- **Kullanıcı Deneyimi:**
  - Loading spinner
  - Markdown içerik syntax highlight ile render edilir
  - Beğeni anlık güncellenir
- **Teknik Detaylar:**
  - Routing: `/posts/:slug`
  - State: blog, comments, liked, likesCount
  - ReactMarkdown + remark-gfm

---

### 17. Blog Yazısı Oluşturma Sayfası
- **API Endpoint:** `POST /blogs`
- **Görev:** Yeni blog yazısı oluşturma
- **UI Bileşenleri:**
  - Başlık input
  - Özet (excerpt) textarea
  - Kategori select
  - Tag input (virgülle ayırma)
  - Kapak resmi yükleme
  - Markdown editör (react-md-editor)
  - "Taslak Kaydet" ve "Yayına Gönder" butonları
- **Form Validasyonu:**
  - Başlık ve içerik zorunlu
  - Kategori seçimi zorunlu
- **Kullanıcı Deneyimi:**
  - Başarılıysa "Yazı onaya gönderildi" toast
  - Resim yükleyince URL otomatik eklenir
- **Teknik Detaylar:**
  - Routing: `/posts/create` (PrivateRoute)
  - Cloudinary'e upload sonrası URL editöre eklenir

---

### 18. Blog Yazısı Düzenleme Sayfası
- **API Endpoint:** `PUT /blogs/{blogId}`
- **Görev:** Mevcut blog yazısını düzenleme
- **UI Bileşenleri:**
  - Oluşturma sayfasıyla aynı bileşenler (mevcut değerlerle dolu)
  - "Güncelle" butonu
- **Kullanıcı Deneyimi:**
  - Mevcut veriler form'a otomatik yüklenir
  - Başarılıysa "Yazı güncellendi" toast
- **Teknik Detaylar:**
  - Routing: `/posts/:id/edit` (PrivateRoute)
  - blogId ile mevcut veri çekilir

---

### 19. Blog Yazısı Silme
- **API Endpoint:** `DELETE /blogs/{blogId}`
- **Görev:** Blog yazısını silme (blog detay sayfasından)
- **UI Bileşenleri:**
  - "Sil" butonu (danger, yazar veya admin için görünür)
  - `window.confirm()` onay dialogu
- **Kullanıcı Deneyimi:**
  - Onay sonrası silme + "Yazı silindi" toast
  - `/posts` sayfasına yönlendirme
- **Teknik Detaylar:**
  - Blog detay sayfasında isAuthor kontrolü yapılır

---

### 20. Blog Beğeni
- **API Endpoint:** `POST /blogs/{blogId}/like`
- **Görev:** Blog yazısını beğenme/beğeniyi geri alma
- **UI Bileşenleri:**
  - ❤️/🤍 toggle butonu + beğeni sayısı
- **Kullanıcı Deneyimi:**
  - Giriş yapmadan beğeniye "Beğenmek için giriş yap" toast
  - Anlık güncelleme
- **Teknik Detaylar:**
  - Toggle işlemi — tek endpoint hem beğeni hem geri alma
  - State: liked, likesCount

---

## 💬 Yorum İşlemleri

### 21. Yorum Ekleme
- **API Endpoint:** `POST /blogs/{blogId}/comments`
- **Görev:** Blog yazısına yorum ekleme
- **UI Bileşenleri:**
  - Textarea (4 satır)
  - "Yorum Gönder" butonu
  - Giriş yapmamışsa "giriş yap" linki
  - Loading state ("Gönderiliyor...")
- **Kullanıcı Deneyimi:**
  - Başarılıysa "Yorumunuz onay için gönderildi" toast
  - Textarea temizlenir
- **Teknik Detaylar:**
  - Blog detay sayfası içinde
  - isAuthenticated kontrolü

---

### 22. Yorum Beğeni
- **API Endpoint:** `POST /blogs/{blogId}/comments/{commentId}/like`
- **Görev:** Yorum beğenme/geri alma
- **UI Bileşenleri:**
  - ❤️/🤍 toggle butonu + beğeni sayısı (yorum kartında)
- **Kullanıcı Deneyimi:**
  - Anlık güncelleme
  - Giriş yapmadan "giriş yap" toast
- **Teknik Detaylar:**
  - Blog detay sayfası içinde
  - State: comments (map ile güncellenir)

---

### 23. Onay Bekleyen Yorumları Listeleme (Admin)
- **API Endpoint:** `GET /comments?status=pending`
- **Görev:** Admin panelinde bekleyen yorumları listeleme
- **UI Bileşenleri:**
  - Yorum kartları (içerik, yazar, tarih)
  - "Onayla" ve "Reddet" butonları
  - Loading spinner
  - "Bekleyen yorum yok" empty state
- **Teknik Detaylar:**
  - AdminDashboard sayfası içinde
  - AdminRoute koruması

---

### 24. Yorum Güncelleme (Admin)
- **API Endpoint:** `PUT /comments/{commentId}`
- **Görev:** Yorumu onaylama veya reddetme
- **UI Bileşenleri:**
  - "Onayla" butonu (green)
  - "Reddet" butonu (red)
  - Loading state
- **Kullanıcı Deneyimi:**
  - İşlem sonrası yorum listeden kalkar
  - Toast mesajı
- **Teknik Detaylar:**
  - AdminDashboard içinde

---

### 25. Yorum Silme
- **API Endpoint:** `DELETE /comments/{commentId}`
- **Görev:** Kullanıcının kendi yorumunu silmesi
- **UI Bileşenleri:**
  - "sil" butonu (kırmızı, yorum sahibi veya admin için görünür)
  - `window.confirm()` onay dialogu
- **Kullanıcı Deneyimi:**
  - Onay sonrası yorum listeden kalkar
  - "Yorum silindi" toast
- **Teknik Detaylar:**
  - Blog detay sayfasında isAuthor kontrolü yapılır

---

## 🗂️ Kategori İşlemleri

### 26. Kategorileri Listeleme
- **API Endpoint:** `GET /categories`
- **Görev:** Yazılar sayfasında kategori filtre butonlarını gösterme
- **UI Bileşenleri:**
  - Yatay kaydırılabilir buton listesi
  - "Tümü" butonu
  - Her kategori için icon + isim
- **Teknik Detaylar:**
  - PostList sayfasında
  - Uygulama başladığında çekilir

---

### 27. Kategoriye Ait Blogları Getirme
- **API Endpoint:** `GET /categories/{categoryId}/blogs`
- **Görev:** Seçilen kategoriye göre blog filtreleme
- **UI Bileşenleri:**
  - Seçili kategori butonu aktif (primary style)
  - Blog kartları filtrelenmiş olarak gösterilir
- **Teknik Detaylar:**
  - URL parametresi: `?category=categoryId`
  - PostList sayfasında useSearchParams ile yönetilir

---

### 28. Kategori Ekleme (Admin)
- **API Endpoint:** `POST /categories`
- **Görev:** Admin panelinde yeni kategori ekleme
- **UI Bileşenleri:**
  - Kategori adı input
  - Icon input (emoji)
  - "Ekle" butonu
- **Teknik Detaylar:**
  - AdminDashboard içinde

---

### 29. Kategori Silme (Admin)
- **API Endpoint:** `DELETE /categories/{categoryId}`
- **Görev:** Admin panelinde kategori silme
- **UI Bileşenleri:**
  - Her kategori yanında "Sil" butonu
  - `window.confirm()` onay
- **Teknik Detaylar:**
  - AdminDashboard içinde

---

## 🔔 Bildirim İşlemleri

### 30. Bildirimleri Listeleme
- **API Endpoint:** `GET /notifications`
- **Görev:** Navbar'da bildirim dropdown'u
- **UI Bileşenleri:**
  - 🔔 ikonu (okunmamış varsa kırmızı badge)
  - Dropdown listesi (max 360px yükseklik, scroll)
  - Her bildirim: ikon, mesaj, tarih
  - "Bildirim yok" empty state
- **Kullanıcı Deneyimi:**
  - Her sayfa değişiminde güncellenir
  - Dropdown açıldığında tüm bildirimler okundu sayılır
- **Teknik Detaylar:**
  - Navbar içinde
  - State: notifications, unreadCount, notifOpen

---

### 31. Tüm Bildirimleri Okundu Say
- **API Endpoint:** `PUT /notifications/read-all`
- **Görev:** Bildirim dropdown açıldığında tüm bildirimleri okundu işaretleme
- **UI Bileşenleri:**
  - "Tümünü okundu say" butonu (dropdown header'da)
  - Badge sayısı 0'a düşer
- **Teknik Detaylar:**
  - Navbar içinde otomatik çağrılır

---

### 32. Bildirim Okundu Say
- **API Endpoint:** `PUT /notifications/{id}/read`
- **Görev:** Tek bildirimi okundu işaretleme
- **Teknik Detaylar:**
  - Şu an kullanılmıyor, tüm bildirimler toplu okunuyor

---

## 📁 Upload

### 33. Resim Yükleme
- **API Endpoint:** `POST /upload/image`
- **Görev:** Blog oluşturma/düzenleme sırasında resim yükleme
- **UI Bileşenleri:**
  - Dosya seçme butonu
  - Yükleme progress göstergesi
  - Yüklenen resim önizlemesi
- **Kullanıcı Deneyimi:**
  - Yükleme sonrası URL otomatik form'a eklenir
  - Hata durumunda error toast
- **Teknik Detaylar:**
  - multipart/form-data
  - Cloudinary'e yüklenir, URL döner

---

## ✅ Health Check

### 34. Sistem Durumu
- **API Endpoint:** `GET /health`
- **Görev:** API'nin çalışıp çalışmadığını kontrol etme
- **UI Bileşenleri:**
  - Görünür UI yok
- **Teknik Detaylar:**
  - `https://api.cyberinf.com.tr/api/health` direkt tarayıcıda açılabilir

---

> 🔒 Tüm korumalı endpoint'lerde `Authorization: Bearer {accessToken}` header'ı otomatik olarak `api.js` axios interceptor tarafından eklenir.

## Grup Üyelerinin Web Frontend Görevleri

1. [Ali Tutar'ın Web Frontend Görevleri](Cihan-Umut-Çolak/Cihan-Umut-Çolak-Web-Frontend-Gorevleri.md)

---

# CyberInf Web Frontend Prensipleri

---

### 1. Responsive Tasarım
- **Mobile-First Approach:** Önce mobil tasarım, sonra desktop
- **Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Flexible Layouts:** CSS Flexbox ve Grid kullanımı
- **Responsive Grid:** 3 sütun (desktop) → 2 sütun (tablet) → 1 sütun (mobile)
- **Touch-Friendly:** Butonlar minimum 44x44px touch target

---

### 2. Tasarım Sistemi
- **CSS Framework:** Custom CSS (framework kullanılmadı)
- **Renk Paleti:** CSS variables ile siber güvenlik teması
  - `--bg-primary: #0d1117` (arka plan)
  - `--accent-green: #3fb950` (vurgu rengi)
  - `--text-primary: #e6edf3` (metin)
  - `--border: #30363d` (kenarlık)
- **Tipografi:** JetBrains Mono (monospace, Google Fonts)
- **Spacing:** 0.5rem, 1rem, 1.5rem, 2rem, 3rem grid
- **Iconography:** Emoji ikonlar (yükleme gerektirmez)
- **Component Library:** Custom React bileşenleri (card, badge, btn, form-input)

---

### 3. Performans Optimizasyonu
- **Code Splitting:** React Router ile route-based splitting
- **Lazy Loading:** Blog kartlarında resimler lazy load
- **Build Tool:** Create React App (Webpack tabanlı)
- **Bundle:** Production build'de otomatik minification
- **Resim Optimizasyonu:** Cloudinary üzerinden otomatik format ve boyut optimizasyonu
- **CDN:** Vercel Edge Network üzerinden serve

---

### 4. SEO
- **Meta Tags:** `public/index.html` içinde title ve description
- **Semantic HTML:** `<nav>`, `<main>`, `<h1>`, `<h2>` gibi semantik elementler
- **Alt Text:** Blog kapak resimleri için `alt` attribute
- **Hosting:** Vercel (otomatik HTTPS, CDN)

---

### 5. Erişilebilirlik (Accessibility)
- **Keyboard Navigation:** Tab ile form elementleri arasında geçiş
- **Focus States:** Input focus'ta yeşil border (`--accent-green`)
- **ARIA:** Form label'ları `htmlFor` ile input'lara bağlı
- **Renk Kontrastı:** Koyu arka plan + açık metin (yüksek kontrast)
- **Loading States:** Spinner ile yükleme durumu gösterimi

---

### 6. Browser Compatibility
- **Desteklenen Tarayıcılar:** Chrome, Firefox, Safari, Edge (son 2 versiyon)
- **CSS:** Flexbox ve Grid (tüm modern tarayıcılarda desteklenir)
- **JavaScript:** ES6+ (Create React App otomatik transpile eder)
- **Webkit:** `-webkit-line-clamp` ile metin kısaltma (blog kartları)

---

### 7. State Management
- **Global State:** React Context API (`AuthContext`)
  - `user`, `isAuthenticated`, `isAdmin`, `loading`
  - `login`, `logout`, `updateUser` fonksiyonları
- **Local State:** `useState` hook (form, loading, error state)
- **Server State:** Axios ile doğrudan fetch, manuel state yönetimi
- **Form State:** Native `useState` (form kütüphanesi kullanılmadı)

---

### 8. Routing
- **Client-Side Routing:** React Router v6
- **Route Yapısı:**
  - `/` → Anasayfa
  - `/posts` → Yazılar
  - `/posts/:slug` → Blog detay
  - `/posts/create` → Yazı oluştur (PrivateRoute)
  - `/posts/:id/edit` → Yazı düzenle (PrivateRoute)
  - `/profile` → Kendi profili (PrivateRoute)
  - `/profile/:userId` → Başka kullanıcı profili
  - `/dashboard` → Dashboard (PrivateRoute)
  - `/admin/*` → Admin paneli (AdminRoute)
  - `/login`, `/register` → GuestRoute
  - `/forgot-password`, `/reset-password` → GuestRoute
  - `/verify-email` → Email doğrulama
- **Route Koruması:**
  - `PrivateRoute` — giriş zorunlu
  - `AdminRoute` — admin rolü zorunlu
  - `GuestRoute` — giriş yapılmamış olmalı

---

### 9. API Entegrasyonu
- **HTTP Client:** Axios
- **Base URL:** `https://api.cyberinf.com.tr/api`
- **Request Interceptor:** Her istekte `Authorization: Bearer {token}` header'ı otomatik eklenir
- **Response Interceptor:** 401 gelince refresh token ile otomatik yenileme, başarısız olursa `/login`'e yönlendirme
- **Error Handling:** try/catch bloklarında toast notification ile kullanıcıya gösterilir
- **CORS:** Backend'de `origin: ['https://cyberinf.com.tr']` ayarlı

---

### 10. Testing
- Şu an otomatik test yazılmadı
- Manuel test: tarayıcı DevTools ile network istekleri kontrol
- API test: Postman veya tarayıcı ile endpoint testleri

---

### 11. Build ve Deployment
- **Build Tool:** Create React App (Webpack)
- **Package Manager:** npm
- **Environment Variables:** `.env` dosyası (`REACT_APP_API_URL`)
- **CI/CD:** GitHub → Vercel otomatik deploy (her push'ta)
- **Hosting:** Vercel (Frontend) + Render (Backend)
- **Domain:** `cyberinf.com.tr` (Vercel), `api.cyberinf.com.tr` (Render)
- **SSL:** Otomatik HTTPS (Vercel + Render)
- **Branch:** `main` branch production'a deploy edilir
