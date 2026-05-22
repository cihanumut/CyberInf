# CyberInf REST API Metotları
**Base URL:** `https://cyberinf.onrender.com/api`  
**API Test Videosu:** [Link buraya eklenecek](https://www.youtube.com/watch?v=siPAm-LDcbU)

---

## 🔐 Authentication İşlemleri

### 1. Üye Olma
- **Endpoint:** `POST /auth/register`
- **Request Body:**
  ```json
  {
    "username": "h4ck3r_nick",
    "email": "kullanici@example.com",
    "password": "Guvenli123!"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "Hesabınız oluşturuldu. Lütfen email adresinizi doğrulayın."
  }
  ```

---

### 2. Giriş Yapma
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "email": "kullanicii@example.com",
    "password": "Guvenli123!"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Giriş başarılı!",
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "...",
      "username": "h4ck3r_nick",
      "email": "kullanici@example.com",
      "role": "user"
    }
  }
  ```

---

### 3. Çıkış Yapma
- **Endpoint:** `POST /auth/logout`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  { "message": "Başarıyla çıkış yapıldı." }
  ```

---

### 4. Mevcut Kullanıcı Bilgisi
- **Endpoint:** `GET /auth/me`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  {
    "user": {
      "id": "...",
      "username": "h4ck3r_nick",
      "email": "kullanici@example.com",
      "role": "user",
      "bio": "...",
      "followersCount": 10,
      "followingCount": 5
    }
  }
  ```

---

### 5. Token Yenileme
- **Endpoint:** `POST /auth/refresh-token`
- **Request Body:**
  ```json
  { "refreshToken": "eyJ..." }
  ```
- **Response:** `200 OK`
  ```json
  {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
  ```

---

### 6. Email Doğrulama
- **Endpoint:** `GET /auth/verify-email?token=xxx&email=xxx`
- **Query Parameters:**
  - `token` (string, required) - Doğrulama token'ı
  - `email` (string, required) - Kullanıcı email adresi
- **Response:** `200 OK`
  ```json
  { "message": "Email adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz." }
  ```

---

### 7. Doğrulama Maili Tekrar Gönder
- **Endpoint:** `POST /auth/resend-verification`
- **Request Body:**
  ```json
  { "email": "kullanici@example.com" }
  ```
- **Response:** `200 OK`
  ```json
  { "message": "Doğrulama maili tekrar gönderildi." }
  ```

---

### 8. Şifre Sıfırlama İsteği
- **Endpoint:** `POST /auth/password-reset`
- **Request Body:**
  ```json
  { "email": "kullanici@example.com" }
  ```
- **Response:** `200 OK`
  ```json
  { "message": "Eğer bu email kayıtlıysa şifre sıfırlama linki gönderildi." }
  ```

---

### 9. Şifre Sıfırlama Onayı
- **Endpoint:** `POST /auth/password-reset/confirm`
- **Request Body:**
  ```json
  {
    "token": "abc123...",
    "email": "kullanici@example.com",
    "newPassword": "YeniGuvenli123!"
  }
  ```
- **Response:** `200 OK`
  ```json
  { "message": "Şifreniz başarıyla güncellendi. Lütfen tekrar giriş yapın." }
  ```

---

## 👤 Kullanıcı İşlemleri

### 10. Kullanıcı Bilgilerini Görüntüleme
- **Endpoint:** `GET /users/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Gerekmez
- **Response:** `200 OK`
  ```json
  {
    "user": {
      "_id": "...",
      "username": "h4ck3r_nick",
      "bio": "...",
      "followersCount": 10,
      "followingCount": 5,
      "isFollowing": false
    }
  }
  ```

---

### 11. Kullanıcı Bilgilerini Güncelleme
- **Endpoint:** `PUT /users/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli (sadece kendi hesabı)
- **Request Body:**
  ```json
  {
    "username": "yeni_nick",
    "bio": "Siber güvenlik meraklısı"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Profil güncellendi.",
    "user": { "_id": "...", "username": "yeni_nick", "bio": "..." }
  }
  ```

---

### 12. Kullanıcı Silme
- **Endpoint:** `DELETE /users/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli (kendi hesabı veya admin)
- **Response:** `200 OK`
  ```json
  { "message": "Hesap silindi." }
  ```

---

### 13. Kullanıcının Yazılarını Listeleme
- **Endpoint:** `GET /users/{userId}/blogs`
- **Path Parameters:**
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Gerekmez
- **Response:** `200 OK`
  ```json
  {
    "blogs": [ { "_id": "...", "title": "...", "slug": "..." } ]
  }
  ```

---

### 14. Takip Et / Takibi Bırak
- **Endpoint:** `POST /users/{userId}/follow`
- **Path Parameters:**
  - `userId` (string, required) - Takip edilecek kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  {
    "message": "Takip edildi.",
    "following": true
  }
  ```

---

## 📝 Blog İşlemleri

### 15. Blog Yazıları Listeleme
- **Endpoint:** `GET /blogs`
- **Query Parameters:**
  - `page` (number) - Sayfa numarası
  - `limit` (number) - Sayfa başına yazı sayısı
  - `search` (string) - Arama metni
  - `sort` (string) - Sıralama (`-createdAt` vb.)
- **Authentication:** Gerekmez
- **Response:** `200 OK`
  ```json
  {
    "blogs": [ { "_id": "...", "title": "...", "slug": "..." } ],
    "pagination": { "totalPages": 5, "currentPage": 1 }
  }
  ```

---

### 16. Belirli Bir Blogu Görüntüleme
- **Endpoint:** `GET /blogs/{blogId}`
- **Path Parameters:**
  - `blogId` (string, required) - Blog ID veya slug
- **Authentication:** Gerekmez
- **Response:** `200 OK`
  ```json
  {
    "blog": { "_id": "...", "title": "...", "content": "...", "views": 42 },
    "comments": [ { "_id": "...", "content": "..." } ]
  }
  ```

---

### 17. Blog Yazısı Ekleme
- **Endpoint:** `POST /blogs`
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "title": "SQL Injection Nedir?",
    "content": "## Giriş\n...",
    "excerpt": "Kısa özet...",
    "category": "categoryId",
    "tags": ["sql", "injection", "web"],
    "coverImage": "https://res.cloudinary.com/..."
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "Yazı oluşturuldu ve onay için gönderildi.",
    "blog": { "_id": "...", "title": "...", "status": "pending" }
  }
  ```

---

### 18. Blog Yazısı Düzenleme
- **Endpoint:** `PUT /blogs/{blogId}`
- **Path Parameters:**
  - `blogId` (string, required) - Blog ID'si
- **Authentication:** Bearer Token gerekli (yazar veya admin)
- **Request Body:**
  ```json
  {
    "title": "Güncellenmiş Başlık",
    "content": "Güncellenmiş içerik..."
  }
  ```
- **Response:** `200 OK`
  ```json
  { "message": "Yazı güncellendi.", "blog": { "_id": "...", "title": "..." } }
  ```

---

### 19. Blog Yazısı Silme
- **Endpoint:** `DELETE /blogs/{blogId}`
- **Path Parameters:**
  - `blogId` (string, required) - Blog ID'si
- **Authentication:** Bearer Token gerekli (yazar veya admin)
- **Response:** `200 OK`
  ```json
  { "message": "Yazı silindi." }
  ```

---

### 20. Blog Beğeni
- **Endpoint:** `POST /blogs/{blogId}/like`
- **Path Parameters:**
  - `blogId` (string, required) - Blog ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  { "liked": true, "likesCount": 15 }
  ```

---

## 💬 Yorum İşlemleri

### 21. Yorum Ekleme
- **Endpoint:** `POST /blogs/{blogId}/comments`
- **Path Parameters:**
  - `blogId` (string, required) - Blog ID'si
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  { "content": "Harika bir yazı!" }
  ```
- **Response:** `201 Created`
  ```json
  { "message": "Yorumunuz onay için gönderildi." }
  ```

---

### 22. Yorum Beğeni
- **Endpoint:** `POST /blogs/{blogId}/comments/{commentId}/like`
- **Path Parameters:**
  - `blogId` (string, required) - Blog ID'si
  - `commentId` (string, required) - Yorum ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  { "liked": true, "likesCount": 5 }
  ```

---

### 23. Yorum Listeleme (Admin)
- **Endpoint:** `GET /comments?status=pending`
- **Query Parameters:**
  - `status` (string) - `pending`, `approved`, `rejected`
- **Authentication:** Bearer Token gerekli (Admin)
- **Response:** `200 OK`
  ```json
  { "comments": [ { "_id": "...", "content": "...", "status": "pending" } ] }
  ```

---

### 24. Yorum Güncelleme (Admin)
- **Endpoint:** `PUT /comments/{commentId}`
- **Path Parameters:**
  - `commentId` (string, required) - Yorum ID'si
- **Authentication:** Bearer Token gerekli (Admin)
- **Request Body:**
  ```json
  { "status": "approved" }
  ```
- **Response:** `200 OK`
  ```json
  { "message": "Yorum güncellendi." }
  ```

---

### 25. Yorum Silme
- **Endpoint:** `DELETE /comments/{commentId}`
- **Path Parameters:**
  - `commentId` (string, required) - Yorum ID'si
- **Authentication:** Bearer Token gerekli (yorum sahibi veya admin)
- **Response:** `200 OK`
  ```json
  { "message": "Yorum silindi." }
  ```

---

## 🗂️ Kategori İşlemleri

### 26. Kategorileri Listeleme
- **Endpoint:** `GET /categories`
- **Authentication:** Gerekmez
- **Response:** `200 OK`
  ```json
  { "categories": [ { "_id": "...", "name": "Web Güvenliği", "icon": "🔐" } ] }
  ```

---

### 27. Kategoriye Ait Blogları Getirme
- **Endpoint:** `GET /categories/{categoryId}/blogs`
- **Path Parameters:**
  - `categoryId` (string, required) - Kategori ID'si
- **Query Parameters:**
  - `page` (number), `limit` (number)
- **Authentication:** Gerekmez
- **Response:** `200 OK`
  ```json
  { "blogs": [ { "_id": "...", "title": "..." } ] }
  ```

---

### 28. Kategori Ekleme (Admin)
- **Endpoint:** `POST /categories`
- **Authentication:** Bearer Token gerekli (Admin)
- **Request Body:**
  ```json
  { "name": "Kriptografi", "icon": "🔑" }
  ```
- **Response:** `201 Created`
  ```json
  { "category": { "_id": "...", "name": "Kriptografi" } }
  ```

---

### 29. Kategori Silme (Admin)
- **Endpoint:** `DELETE /categories/{categoryId}`
- **Path Parameters:**
  - `categoryId` (string, required) - Kategori ID'si
- **Authentication:** Bearer Token gerekli (Admin)
- **Response:** `200 OK`
  ```json
  { "message": "Kategori silindi." }
  ```

---

## 🔔 Bildirim İşlemleri

### 30. Bildirimleri Listeleme
- **Endpoint:** `GET /notifications`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  {
    "notifications": [ { "_id": "...", "message": "...", "isRead": false } ],
    "unreadCount": 3
  }
  ```

---

### 31. Tüm Bildirimleri Okundu Say
- **Endpoint:** `PUT /notifications/read-all`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  { "message": "Tüm bildirimler okundu olarak işaretlendi." }
  ```

---

### 32. Bildirim Okundu Say
- **Endpoint:** `PUT /notifications/{id}/read`
- **Path Parameters:**
  - `id` (string, required) - Bildirim ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  { "message": "Bildirim okundu olarak işaretlendi." }
  ```

---

## 📁 Upload

### 33. Resim Yükleme
- **Endpoint:** `POST /upload/image`
- **Authentication:** Bearer Token gerekli
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `image` (file, required) - jpeg, png, gif, webp (max 20MB)
- **Response:** `200 OK`
  ```json
  {
    "message": "Resim başarıyla yüklendi.",
    "url": "https://res.cloudinary.com/cyberinf/..."
  }
  ```

---

## ✅ Health Check

### 34. Sistem Durumu
- **Endpoint:** `GET /health`
- **Authentication:** Gerekmez
- **Response:** `200 OK`
  ```json
  { "status": "OK", "message": "CyberBlog API çalışıyor", "version": "2.0.0" }
  ```

---

> 🔒 Bearer Token: İsteklerde `Authorization: Bearer {accessToken}` header'ı gönderilmelidir.
