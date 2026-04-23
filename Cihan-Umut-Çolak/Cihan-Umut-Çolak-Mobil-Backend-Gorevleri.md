# CyberInf Mobil Backend Görevleri 

## 1. Kullanıcı Kayıt Servisi
- **API Endpoint:** `POST /auth/register`
- **Görev:** Yeni kullanıcıların sisteme dahil edilmesi ve doğrulama sürecinin başlatılması.
- **İşlevler:**
  - Kullanıcı adı, email ve şifre verilerinin toplanması.
  - Şifre karmaşıklığı ve email format kontrolü.
  - Başarılı kayıt sonrası "Email doğrulama" uyarısının gösterilmesi.
- **Teknik Detaylar:**
  - `axios` ile asenkron POST isteği.
  - 400 (Bad Request) ve 409 (Conflict) hata kodlarının yönetimi.

## 2. Giriş ve Oturum Yönetimi Servisi
- **API Endpoint:** `POST /auth/login`
- **Görev:** Güvenli kimlik doğrulama ve oturumun kalıcı hale getirilmesi.
- **İşlevler:**
  - Email ve şifre ile JWT token alınması.
  - Gelen token'ın `AsyncStorage` üzerinde güvenli saklanması.
  - Uygulama açılışında otomatik giriş (Auto-login) kontrolü.
- **Teknik Detaylar:**
  - JWT token yönetimi ve süresi dolan tokenların temizlenmesi.
  - Global `AuthContext` durumunun güncellenmesi.

## 3. Blog Akışı (Feed) Servisi
- **API Endpoint:** `GET /blogs`
- **Görev:** Ana sayfadaki yazı listesinin dinamik ve performanslı çekilmesi.
- **İşlevler:**
  - Tüm yayınlanmış yazıların listelenmesi.
  - Sayfalama (Pagination) ile verinin parça parça çekilmesi.
  - Kategoriye göre query tabanlı filtreleme.
- **Teknik Detaylar:**
  - Redis önbelleği ile uyumlu veri çekme süreci.
  - `RefreshControl` ile pull-to-refresh entegrasyonu.

## 4. Yazı Detay ve Yorum Çekme Servisi
- **API Endpoint:** `GET /blogs/:id`
- **Görev:** Bir yazının tüm içeriğinin ve ilgili yorumların getirilmesi.
- **İşlevler:**
  - Yazı içeriği (Markdown), yazar ve kategori detaylarının çekilmesi.
  - Yazıya ait onaylanmış yorumların listelenmesi.
  - İzlenme sayısının (views) artırılması.
- **Teknik Detaylar:**
  - Markdown verisinin mobil render motoruna iletilmesi.
  - İlişkili verilerin (populate) parse edilmesi.

## 5. Medya Yükleme Servisi
- **API Endpoint:** `POST /upload/image`
- **Görev:** Yazı kapakları veya avatarlar için görsellerin sunucuya iletilmesi.
- **İşlevler:**
  - Galeriden seçilen resmin `FormData` formatına dönüştürülmesi.
  - Sunucudan dönen görsel URL'sinin yakalanması.
- **Teknik Detaylar:**
  - `multipart/form-data` request header yönetimi.
  - Resim sıkıştırma ve optimizasyon süreci.

## 6. Yeni Yazı Oluşturma ve Düzenleme Servisi
- **API Endpoint:** `POST /blogs`, `PUT /blogs/:id`
- **Görev:** Kullanıcı içeriklerinin sisteme kaydedilmesi ve güncellenmesi.
- **İşlevler:**
  - Başlık, içerik ve kategori verilerinin gönderilmesi.
  - Yazının taslak veya onaya gönderilme durumunun yönetimi.
- **Teknik Detaylar:**
  - Zengin metin (Markdown) verisinin güvenli iletimi.
  - İşlem sonrası ana sayfa önbelleğinin geçersiz kılınması.

## 7. Beğeni ve Sosyal Etkileşim Servisi
- **API Endpoint:** `POST /blogs/:id/like`
- **Görev:** Yazıların kullanıcılar tarafından etkileşim alması.
- **İşlevler:**
  - Yazı beğenme ve beğeniyi geri çekme.
  - Beğeni sayısının anlık senkronizasyonu.
- **Teknik Detaylar:**
  - Optimistic UI Update (Cevap beklemeden ikon değişimi).
  - Haptic feedback tetikleyicileri.

## 8. Takip ve Sosyal Ağ Servisi
- **API Endpoint:** `POST /users/:id/follow`
- **Görev:** Kullanıcılar arası takip ilişkisinin kurulması.
- **İşlevler:**
  - Bir kullanıcıyı takip etme veya takibi bırakma.
  - Takipçi/Takip edilen sayılarının anlık güncellenmesi.
- **Teknik Detaylar:**
  - Kullanıcı ID'si üzerinden dinamik takip kontrolü.
  - Sosyal bildirimlerin (Notification) tetiklenmesi.

## 9. Yorum Yapma ve Silme Servisi
- **API Endpoint:** `POST /comments`, `DELETE /comments/:id`
- **Görev:** İçerik altı topluluk etkileşiminin yönetilmesi.
- **İşlevler:**
  - Yazılara yeni yorum ekleme veya yanıtlama.
  - Kullanıcının kendi yorumunu kalıcı olarak silebilmesi.
- **Teknik Detaylar:**
  - Nested (iç içe) yorum yapısının frontend'e uyarlanması.
  - Klavye yönetimi ve anlık liste güncellemesi.

## 10. Bildirim Merkezi Servisi
- **API Endpoint:** `GET /notifications`
- **Görev:** Kullanıcıya gelen sosyal uyarıların anlık takibi.
- **İşlevler:**
  - Beğeni, takip ve yorum yanıtlarının listelenmesi.
  - Okunmamış bildirimlerin işaretlenmesi.
- **Teknik Detaylar:**
  - Sekme çubuğu (Tab Bar) üzerinde badge gösterimi.
  - Bildirime tıklandığında ilgili içeriğe yönlendirme.

## 11. Profil Bilgileri Görüntüleme ve Düzenleme Servisi
- **API Endpoint:** `GET /users/:id`, `PUT /users/:id`
- **Görev:** Kullanıcı kimliğinin ve görselliğinin yönetilmesi.
- **İşlevler:**
  - Profil verilerini çekme.
  - Kullanıcı adı, bio ve avatar güncelleme.
- **Teknik Detaylar:**
  - Güncelleme sonrası `AuthContext` üzerinden global state yenileme.
  - Redis cache temizleme tetikleyicisi.

## 12. Global Arama ve Filtreleme Servisi
- **API Endpoint:** `GET /users`, `GET /blogs?search=...`
- **Görev:** Uygulama içi içerik ve kullanıcı keşfi.
- **İşlevler:**
  - Metin tabanlı arama sonuçlarının getirilmesi.
  - "Yazılar" ve "Kullanıcılar" olarak sonuçların ayrıştırılması.
- **Teknik Detaylar:**
  - `Debounce` mekanizması ile arama performansının optimize edilmesi.
  - Query parametrelerinin yönetimi.

## 13. Admin Moderasyon Servisi
- **API Endpoint:** `/admin/*`
- **Görev:** İçerik denetimi ve platform yönetimi.
- **İşlevler:**
  - Bekleyen yazıların onaylanması/reddedilmesi.
  - Red sebebi ile yazarın bilgilendirilmesi.
- **Teknik Detaylar:**
  - Admin yetki kontrolü (RBAC).
  - Statü geçişlerinin güvenli yönetimi.

## 14. Hesap Silme Servisi
- **API Endpoint:** `DELETE /users/:userId`
- **Görev:** Kullanıcı gizliliği kapsamında tüm verilerin imha edilmesi.
- **İşlevler:**
  - Kullanıcı hesabı, yazıları ve yorumlarının silinmesi.
  - Oturumun tamamen sonlandırılması.
- **Teknik Detaylar:**
  - Çift onaylı confirmation dialog yönetimi.
  - Yerel depolamanın (`AsyncStorage`) temizlenmesi.
