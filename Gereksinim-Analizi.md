# Gereksinim Analizi

Aşağıda uygulamaya ait gereksinim analizi yapılıp listelenmiştir.Tüm gereksinimler Cihan Umut Çolak tarafından yapılmıştır.

# Tüm Gereksinimler 

---

## 🔐 Authentication İşlemleri

1. **Üye Olma**
   - **API Metodu:** `POST /auth/register`
   - **Açıklama:** Yeni hesap oluşturur. Kayıt sonrası email doğrulama maili gönderilir.

2. **Giriş Yapma**
   - **API Metodu:** `POST /auth/login`
   - **Açıklama:** Kayıtlı kullanıcıların sisteme giriş yapmasını sağlar. Email doğrulanmış olmalıdır. Başarılı girişte `accessToken` ve `refreshToken` döndürülür.

3. **Çıkış Yapma**
   - **API Metodu:** `POST /auth/logout` 🔒
   - **Açıklama:** Kullanıcının sistemden güvenli şekilde çıkış yapmasını sağlar. Refresh token geçersiz hale getirilir.

4. **Mevcut Kullanıcı Bilgisi**
   - **API Metodu:** `GET /auth/me` 🔒
   - **Açıklama:** Giriş yapmış kullanıcının bilgilerini döndürür.

5. **Token Yenileme**
   - **API Metodu:** `POST /auth/refresh-token`
   - **Açıklama:** Refresh token ile yeni access token alır.

6. **Email Doğrulama**
   - **API Metodu:** `GET /auth/verify-email?token=xxx&email=xxx`
   - **Açıklama:** Email doğrulama linkine tıklandığında hesabı aktifleştirir.

7. **Doğrulama Maili Tekrar Gönder**
   - **API Metodu:** `POST /auth/resend-verification`
   - **Açıklama:** Email doğrulama mailini tekrar gönderir.

8. **Şifre Sıfırlama İsteği**
   - **API Metodu:** `POST /auth/password-reset`
   - **Açıklama:** Kullanıcının email adresine şifre sıfırlama linki gönderilir.

9. **Şifre Sıfırlama Onayı**
   - **API Metodu:** `POST /auth/password-reset/confirm`
   - **Body:** `{ token, email, newPassword }`
   - **Açıklama:** Token ile yeni şifre belirlenir.

---

## 👤 Kullanıcı İşlemleri

10. **Profil Görüntüleme**
    - **API Metodu:** `GET /users/:userId`
    - **Açıklama:** Belirli bir kullanıcının profil bilgilerini görüntüler.

11. **Profil Güncelleme**
    - **API Metodu:** `PUT /users/:userId` 🔒
    - **Açıklama:** Kullanıcı kendi bilgilerini (kullanıcı adı, bio) güncelleyebilir.

12. **Hesap Silme**
    - **API Metodu:** `DELETE /users/:userId` 🔒
    - **Açıklama:** Kullanıcı hesabını kalıcı olarak siler.

13. **Kullanıcının Yazılarını Listeleme**
    - **API Metodu:** `GET /users/:userId/blogs`
    - **Açıklama:** Belirli bir kullanıcının blog yazılarını listeler.

14. **Takip Et / Takibi Bırak**
    - **API Metodu:** `POST /users/:userId/follow` 🔒
    - **Açıklama:** Kullanıcıyı takip eder veya takibi bırakır. Toggle çalışır.

---

## 📝 Blog İşlemleri

15. **Blog Yazıları Listeleme**
    - **API Metodu:** `GET /blogs`
    - **Query Params:** `page`, `limit`, `search`, `sort`
    - **Açıklama:** Yayınlanmış tüm blog yazılarını listeler.

16. **Belirli Bir Blogu Görüntüleme**
    - **API Metodu:** `GET /blogs/:blogId`
    - **Açıklama:** Belirli bir blog yazısını getirir. Her istekte görüntülenme sayısı artar.

17. **Blog Yazısı Ekleme**
    - **API Metodu:** `POST /blogs` 🔒
    - **Açıklama:** Yeni blog yazısı ekler. Yazı admin onayına gönderilir.

18. **Blog Yazısı Düzenleme**
    - **API Metodu:** `PUT /blogs/:blogId` 🔒
    - **Açıklama:** Kullanıcı kendi blogunu, admin tüm blogları düzenleyebilir.

19. **Blog Yazısı Silme**
    - **API Metodu:** `DELETE /blogs/:blogId` 🔒
    - **Açıklama:** Kullanıcı kendi blogunu, admin tüm blogları silebilir.

20. **Blog Beğeni**
    - **API Metodu:** `POST /blogs/:blogId/like` 🔒
    - **Açıklama:** Blog yazısını beğenir veya beğeniyi geri alır. Toggle çalışır.

---

## 💬 Yorum İşlemleri

21. **Yorum Ekleme**
    - **API Metodu:** `POST /blogs/:blogId/comments` 🔒
    - **Açıklama:** Blog yazısına yorum ekler. Yorum admin onayına gönderilir.

22. **Yorum Beğeni**
    - **API Metodu:** `POST /blogs/:blogId/comments/:commentId/like` 🔒
    - **Açıklama:** Yorumu beğenir veya beğeniyi geri alır. Toggle çalışır.

23. **Yorum Listeleme (Admin)**
    - **API Metodu:** `GET /comments?status=pending` 🔒 Admin
    - **Açıklama:** Onay bekleyen yorumları listeler.

24. **Yorum Güncelleme (Admin)**
    - **API Metodu:** `PUT /comments/:commentId` 🔒 Admin
    - **Açıklama:** Yorumu onaylar veya reddeder.

25. **Yorum Silme**
    - **API Metodu:** `DELETE /comments/:commentId` 🔒
    - **Açıklama:** Yorum sahibi veya admin yorumu siler.

---

## 🗂️ Kategori İşlemleri

26. **Kategorileri Listeleme**
    - **API Metodu:** `GET /categories`
    - **Açıklama:** Tüm kategorileri listeler.

27. **Kategoriye Ait Blogları Getirme**
    - **API Metodu:** `GET /categories/:categoryId/blogs`
    - **Açıklama:** Seçilen kategoriye ait blog yazılarını listeler.

28. **Kategori Ekleme (Admin)**
    - **API Metodu:** `POST /categories` 🔒 Admin
    - **Açıklama:** Yeni kategori ekler.

29. **Kategori Silme (Admin)**
    - **API Metodu:** `DELETE /categories/:categoryId` 🔒 Admin
    - **Açıklama:** Kategori siler.

---

## 🔔 Bildirim İşlemleri

30. **Bildirimleri Listeleme**
    - **API Metodu:** `GET /notifications` 🔒
    - **Açıklama:** Kullanıcının bildirimlerini listeler.

31. **Tüm Bildirimleri Okundu Say**
    - **API Metodu:** `PUT /notifications/read-all` 🔒
    - **Açıklama:** Tüm bildirimleri okundu olarak işaretler.

32. **Bildirim Okundu Say**
    - **API Metodu:** `PUT /notifications/:id/read` 🔒
    - **Açıklama:** Belirli bir bildirimi okundu olarak işaretler.

---

## 📁 Upload

33. **Resim Yükleme**
    - **API Metodu:** `POST /upload/image` 🔒
    - **Content-Type:** `multipart/form-data`
    - **Açıklama:** Resim yükler, Cloudinary'e kaydeder ve URL döndürür.

---

## ✅ Health Check

34. **Sistem Durumu**
    - **API Metodu:** `GET /health`
    - **Açıklama:** API'nin çalışıp çalışmadığını kontrol eder.

---

🔒 = Giriş yapılmış olması gerekir (Bearer Token)  
🔒 Admin = Sadece admin rolü gerektirir

# Gereksinim Dağılımları
1. [Cihan Umut Çolak'ın Gereksinimleri](Cihan-Umut-Çolak/Cihan-Umut-Çolak-Gereksinimler.md)
