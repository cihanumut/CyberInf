## Grup Üyelerinin Mobil Frontend Görevleri

1. [Cihan Umut Çolak'ın Mobil Frontend Görevleri](Cihan-Umut-Çolak/Cihan-Umut-Çolak-Mobil-Frontend-Gorevleri.md)
   
---

# CyberInf Mobil Frontend Teknik Mimari ve Özellik Listesi

## 1. Tasarım Sistemi ve Görsel Kimlik (Nebula Dark)
- **Renk Teorisi:** Proje genelinde `#000000` merkezli, `#58a6ff` (Cyber Blue) vurgulu derin karanlık tema uygulanmıştır.
- **Tipografi:** Google Fonts standartlarına uygun, başlık hiyerarşisi (H1-H4) netleşmiş yazı tipleri.
- **Mikro-Etkileşimler:** Butonlara basıldığında `activeOpacity` efektleri ve geçişlerde akıcı animasyonlar.
- **Bileşen Kütüphanesi:** Tamamen özelleştirilmiş kart yapıları, input alanları ve modallar.

## 2. State Management (Durum Yönetimi)
- **AuthContext:** Kullanıcının oturum durumu (token, kullanıcı bilgileri) tüm uygulama genelinde merkezi olarak yönetilir.
- **AlertContext:** Hata, başarı ve bilgi mesajları için merkezi bir "Global Alert" sistemi kullanılır.
- **Local State:** Karmaşıklığı azaltmak için sayfa bazlı işlemlerde `useState` ve `useReducer` optimizasyonu.

## 3. Navigasyon ve Rotalama (Deep Architecture)
- **Expo-Router:** Dosya tabanlı (File-based) modern yönlendirme sistemi.
- **Tab & Stack Hybrid:** Alt sekmeler (Feed, Search, Create, Notifications, Profile) ve bu sekmelerin içinde açılan detay sayfaları.
- **Yönlendirme Mantığı:** Yetkisiz kullanıcıların korumalı sayfalara (Profil, Yazı Oluşturma) girmesini engelleyen otomatik yönlendirme mekanizması.

## 4. Kimlik Doğrulama ve Güvenlik (Auth)
- **Persistence (Kalıcılık):** `AsyncStorage` entegrasyonu ile kullanıcı uygulamayı kapatsa dahi oturumun korunması.
- **JWT Handling:** Her API isteğine otomatik olarak Bearer token ekleyen `Axios Interceptors` altyapısı.
- **Güvenli Çıkış:** Tek tıkla yerel verilerin temizlenmesi ve oturumun sonlandırılması.

## 5. İçerik Oluşturma ve Markdown Gücü
- **Zengin Metin Desteği:** Kullanıcıların kod blokları, listeler ve başlıklar içeren teknik yazılar yazabilmesi için Markdown desteği.
- **Resim Yönetimi:** `expo-image-picker` ile galeriye erişim, resim seçimi ve backend'e `multipart/form-data` ile güvenli aktarım.
- **Taslak Sistemi:** Yazıları yayınlamadan önce yerel veya sunucu tabanlı taslak olarak kaydetme yeteneği.

## 6. Sosyal Etkileşim ve Dinamik Akış
- **Like & Comment:** Yazıları beğenme ve hiyerarşik (nested) yorum yapabilme altyapısı.
- **Takip Sistemi:** Kullanıcılar arası takip et/bırak mekanizması ve profil sayfalarında anlık istatistik güncellemeleri.
- **Feed Optimizasyonu:** `useFocusEffect` ve `useCallback` ile ana sayfanın her zaman güncel kalmasını sağlayan "Focus-based Refresh" sistemi.

## 7. Gelişmiş Profil ve Hesap Yönetimi
- **Kişiselleştirme:** Avatar yükleme, kullanıcı adı değiştirme ve biyografi güncelleme.
- **Hesap Güvenliği:** Hesabı tüm verilerle birlikte kalıcı olarak silme (Account Deletion) akışı ve çift onaylı güvenlik bariyeri.
- **İstatistik Takibi:** Takipçi, Takip Edilen ve Yazı Sayısı gibi verilerin anlık izlenmesi.

## 8. Bildirim ve Etkileşim Merkezi
- **Real-time Notifications:** Beğeni, takip ve yorum yanıtları için backend entegrasyonlu bildirim listesi.
- **Badge Sistemi:** Okunmamış bildirim sayısının kullanıcıya görsel olarak (rozet) bildirilmesi.
- **Smart Redirect:** Bildirime tıklandığında doğrudan ilgili içeriğe (Post veya User Profile) akıllı yönlendirme.

## 9. Arama ve Keşfetme Teknolojileri
- **Anlık Arama:** Kelime yazıldığında sunucuyu yormadan çalışan `Debounce` destekli arama motoru.
- **Filtreleme:** Yazıları kategorilerine (Siber Güvenlik, Yazılım, vb.) göre saniyeler içinde süzme yeteneği.
- **Kullanıcı Arama:** Diğer kullanıcıları kullanıcı adlarına göre bulma ve profillerini inceleme.

## 10. Admin ve Moderasyon Yetenekleri
- **İçerik Onay:** Admin kullanıcılar için bekleyen yazıları onaylama veya reddetme arayüzü.
- **Yorum Moderasyonu:** Uygunsuz yorumları kaldırma ve topluluk kurallarını uygulama yetkisi.
- **Geri Bildirim:** Reddedilen yazılar için yazarın görebileceği "Red Nedeni" açıklama sistemi.

## 11. Performans ve Kaynak Yönetimi
- **Redis Caching:** Backend tarafındaki Redis önbelleğinin frontend ile senkronize çalışması (Cache Invalidation).
- **Lazy Loading:** Liste görünümlerinde sadece ekranda olan öğelerin yüklenmesi ile minimum RAM kullanımı.
- **Görsel Optimizasyon:** Resimlerin sıkıştırılarak yüklenmesi ve asenkron yükleme (Lazy image loading).

## 12. Hata ve Form Yönetimi
- **Validasyon:** Form alanlarında gerçek zamanlı veri doğruluğu kontrolü.
- **Klavye Yönetimi:** `KeyboardAvoidingView` ile her ekran boyutunda sorunsuz form girişi.
- **Feedback Loop:** Her işlem sonrası (yazı paylaşma, profil güncelleme) kullanıcıya verilen görsel başarı/hata onayı.
