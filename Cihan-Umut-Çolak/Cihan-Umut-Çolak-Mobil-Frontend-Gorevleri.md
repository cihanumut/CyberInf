# Cihan Umut Çolak'ın CyberInf Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Giriş Yap (Login) Ekranı
- **API Endpoint:** `POST /auth/login`
- **Görev:** Kullanıcı güvenli oturum açma işlemi için ekran tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Email input alanı (keyboard type: email)
  - Şifre input alanı (secure text entry)
  - "Giriş Yap" butonu (Nebula Blue gradyanlı, yükleme animasyonlu)
  - "Şifremi Unuttum" ve "Yeni Hesap Oluştur" linkleri
- **Kullanıcı Deneyimi:**
  - Hatalı girişlerde (401 Unauthorized) AlertContext ile anlık geri bildirim
  - `AsyncStorage` ile JWT token saklama ve otomatik login (Persistence)
  - Klavye açıldığında formun yukarı kaydırılması (KeyboardAvoidingView)

## 2. Üye Olma (Kayıt) Ekranı
- **API Endpoint:** `POST /auth/register`
- **Görev:** Yeni kullanıcı kayıt süreci ve email doğrulama akışı tasarımı
- **UI Bileşenleri:**
  - Kullanıcı Adı (username) girişi (CyberInf özel alanı)
  - Email input alanı (Regex format kontrollü)
  - Şifre input alanı (Minimum 6 karakter kısıtı)
  - "Kayıt Ol" butonu (Tüm alanlar dolmadan pasif durumda)
- **Kullanıcı Deneyimi:**
  - Başarılı kayıt sonrası "Lütfen emailinizi doğrulayın" uyarısı
  - Mevcut kullanıcı adı veya email hatasında kullanıcı dostu mesajlar
  - Tek tıklamayla giriş ekranına geri dönüş

## 3. Ana Sayfa ve Blog Akışı (Feed)
- **API Endpoint:** `GET /posts`
- **Görev:** Yayınlanan blog yazılarını listeleyen dinamik keşfet ekranı
- **UI Bileşenleri:**
  - **Blog Kartları:** Kapak resmi, başlık, yazar ismi, kategori rozeti ve tarih
  - **Kategori Çubuğu:** Siber Güvenlik, Yazılım, Yapay Zeka vb. kategorilere göre dinamik filtreleme
  - **Pull-to-refresh:** Listeyi yukarıdan çekerek anlık yenileme desteği
- **Kullanıcı Deneyimi:**
  - Yazılara tıklandığında detay sayfasına akıcı geçiş
  - Resimlerin lazy-loading ile yüklenmesi ve yükleme sırasında skeleton screen efekti

## 4. Blog Yazısı Oluşturma ve Düzenleme
- **API Endpoint:** `POST /blogs, PUT /blogs/{id}`
- **Görev:** İçerik oluşturma ve mevcut yazıları güncelleme yetenekleri
- **UI Bileşenleri:**
  - Başlık ve kategori seçim menüsü
  - **Kapak Fotoğrafı:** expo-image-picker ile galeri erişimi ve resim yükleme
  - **Markdown Editör:** Kalın, eğik, kod bloğu ve link ekleme araç çubuğu
- **Teknik Özellikler:**
  - Yazıyı "Taslak" olarak kaydetme veya "Onaya Gönder" seçeneği
  - Mevcut yazıları düzenleme (Edit Post) ekranı ve backend senkronizasyonu

## 5. Yazı Detay ve İnteraktif Yorum Sistemi
- **API Endpoint:** `GET /posts/{id}, POST /comments`
- **Görev:** Zengin içerik gösterimi ve sosyal etkileşim yönetimi
- **UI Bileşenleri:**
  - **Markdown Renderer:** Yazı içeriğinin profesyonel formatta gösterimi
  - **Beğeni Sistemi:** Anlık durum değişimi, sayaç güncelleme ve haptic feedback
  - **İç İçe Yorumlar:** Yorumlara yanıt verme (reply), yorum beğenme ve silme
- **Kullanıcı Deneyimi:**
  - Yorum yaparken klavye yönetimi ve "Optimistic Update" ile gecikmesiz işlem hissi

## 6. Kullanıcı Profil ve Sosyal İstatistikler
- **API Endpoint:** `GET /users/{userId}`
- **Görev:** Kullanıcı varlığının ve sosyal bağlantılarının yönetimi
- **UI Bileşenleri:**
  - **Avatar Sistemi:** Dinamik resim veya isim baş harfi placeholder'ı
  - **İstatistik Kartı:** Takipçi ve Takip Edilen listelerine erişim
  - **Yazı Yönetimi:** Kullanıcının kendi yazılarını durumlarına (Yayında/Bekliyor/Red) göre görmesi
- **Sosyal Etkileşim:** Diğer kullanıcıları "Takip Et/Bırak" fonksiyonu ve anlık sayaç güncelleme

## 7. Gelişmiş Profil Düzenleme
- **API Endpoint:** `PUT /users/{userId}`
- **Görev:** Kullanıcı kimlik bilgilerinin ve görselliğinin özelleştirilmesi
- **UI Bileşenleri:**
  - **Fotoğraf Güncelleme:** Profil resmini galeriden seçip anında sunucuya yükleme
  - **Biyografi ve Kullanıcı Adı:** Çok satırlı metin editörü ve benzersiz kullanıcı adı kontrolü
- **Teknik Detaylar:**
  - Güncelleme sonrası `AuthContext` üzerinden tüm uygulamanın (Global State) anlık yenilenmesi

## 8. Bildirim Merkezi ve Akıllı Yönlendirme
- **API Endpoint:** `GET /notifications`
- **Görev:** Sosyal etkileşimlerin kullanıcıya anlık bildirilmesi
- **UI Özellikleri:**
  - **Bildirim Tipleri:** Beğeni, yeni takipçi ve yorum yanıtları için özel ikonlar
  - **Okunmamış Göstergesi:** Sekme üzerinde kırmızı badge (sayı) desteği
  - **Derin Linkleme:** Bildirime tıklandığında doğrudan ilgili yazıya veya profile gidiş

## 9. Global Arama ve Keşfet
- **API Endpoint:** `GET /users, GET /posts`
- **Görev:** İçerik ve kullanıcı tabanlı arama motoru
- **UI Bileşenleri:**
  - **Modern Arama Çubuğu:** Debounce mekanizması ile performanslı arama
  - **Sekmeli Sonuçlar:** "Yazılar" ve "Kullanıcılar" için ayrıştırılmış listeleme
- **Kullanıcı Deneyimi:** Arama geçmişi yönetimi ve popüler kategorilere hızlı erişim

## 10. Moderasyon ve Yönetim Paneli (Admin)
- **API Endpoint:** `/admin/*`
- **Görev:** Platform güvenliği ve içerik kalitesi denetimi
- **Admin Yetenekleri:**
  - **Yazı Onay/Red:** Bekleyen yazıları inceleme, onaylama veya reddetme
  - **Red Sebebi:** Reddedilen yazılar için kullanıcıya açıklama gönderme modalı
  - **Yorum Denetimi:** Uygunsuz yorumları admin yetkisiyle kaldırma paneli

## 11. Hesap Silme ve Veri Güvenliği
- **API Endpoint:** `DELETE /users/{userId}`
- **Görev:** Kullanıcı gizliliği kapsamında hesabı kalıcı olarak sonlandırma
- **UI Adımları:**
  - Profil sayfasında güvenli bölge (Danger Zone) erişimi
  - **Çift Onay Mekanizması:** Kritik işlem öncesi kullanıcıdan son onay alma
- **Kullanıcı Deneyimi:** İşlem sonrası oturumun otomatik kapatılması ve tüm yerel verilerin temizlenmesi
