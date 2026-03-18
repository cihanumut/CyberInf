## 🔐 Authentication İşlemleri

1. **Üye Olma** 
 - **API Metodu:** `POST /auth/register`
 - **Açıklama:** Kullanıcıların yeni hesap oluşturmasını sağlar. Email ve şifre ile kayıt yapılır.

2. **Giriş Yapma** 
 - **API Metodu:** `POST /auth/login`
 - **Açıklama:** Kayıtlı kullanıcıların sisteme giriş yapmasını sağlar. Başarılı giriş sonrası JWT token döndürülür.

3. **Şifre Sıfırlama** 
 - **API Metodu:** `POST /auth/forgot-password`
 - **Açıklama:** Kullanıcının email adresine şifre sıfırlama linki gönderilir.

4. **Şifre Sıfırlama Onayı** 
 - **API Metodu:** `POST /auth/reset-password?token=id`
 - **Açıklama:** Kullanıcı token ile yeni şifre belirler.

5. **Çıkış yapma** 
 - **API Metodu:** `POST /auth/logout`
 - **Açıklama:** Kullanıcının sistemden güvenli şekilde çıkış yapmasını sağlar. JWT tabanlı sistemlerde genellikle client tarafında token silinir. Eğer sistemde token blacklist yapısı varsa, token geçersiz hale getirilir.

---

## 👤 Kullanıcı İşlemleri

6. **Profil Görüntüleme** 
 - **API Metodu:** `GET /profile`
 - **Açıklama:** Kullanıcının profil bilgilerini görüntüler. Giriş yapılmış olmalıdır.

7. **Profil Güncelleme**  
 - **API Metodu:** `PUT /profile`
 - **Açıklama:** Kullanıcının ad, soyad, email, telefon gibi bilgilerini günceller. Kullanıcı sadece kendi bilgilerini güncelleyebilir.
  
8. **Hesap Silme**  
 - **API Metodu:** `DELETE /profile`
 - **Açıklama:** Kullanıcı hesabını kalıcı olarak siler. İşlem geri alınamaz.

9. **Kullanıcının Kendi Yazılarını Görüntülemesi**  
 - **API Metodu:** `GET /dashboard`
 - **Açıklama:** Kullanıcının eklediği blog yazılarını listeler. Admin tüm kullanıcıları görüntüleyebilir.
   
---

## 💬 Yorum İşlemleri

10. **Yorum Ekleme**  
    - **API Metodu:** `POST /posts/{blogId}/comments`  
    - **Açıklama:** Belirli bir blog yazısına yorum ekler. Giriş yapılmış olmalıdır..

11. **Onay Bekleyen Yorum Listeleme(Admin)**  
    - **API Metodu:** `GET /comments?status=pending`  
    - **Açıklama:** Adminlerin onay bekleyen yorumları listelemesini sağlar.

12. **Onay Bekleyen Yazıları Görüntüleme(Admin)**  
    - **API Metodu:** `GET /admin/posts`  
    - **Açıklama:** Kullanıcı kendi yorumunu düzenleyebilir. Admin tüm yorumları düzenleyebilir.

13. **Yorum Listeleme(Admin)**  
    - **API Metodu:** `GET /admin/comments`  
    - **Açıklama:** Admin bekleyen tüm yorumları listeleyebilir.

---

## 📝 Blog İşlemleri


14. **Blog Yazısı Ekleme**  
    - **API Metodu:** `POST /posts/create`
    - **Açıklama:** Yeni blog yazısı ekler. Giriş yapılmış olmalıdır.

15. **Blog Yazısı Düzenleme**  
    - **API Metodu:** `PUT /posts/{blogId}`  
    - **Açıklama:** Kullanıcı kendi blogunu düzenleyebilir. Admin tüm blogları düzenleyebilir.

16. **Blog Yazısı Silme**  
    - **API Metodu:** `DELETE /posts/{blogId}`  
    - **Açıklama:** Kullanıcı kendi blogunu silebilir. Admin tüm blogları silebilir.
   
17. **Blog Yazıları Listeleme**  
    - **API Metodu:** `GET /posts`  
    - **Açıklama:** Sistemdeki tüm yazıları getirir.

18. **Belirli Bir Blogu Görüntüleme**  
    - **API Metodu:** `GET /posts/{blogId}`  
    - **Açıklama:** Belirli bir blog yazısını getirir.
   
19. **Admin Sekmesi**  
    - **API Metodu:** `GET /admin`  
    - **Açıklama:** Sistemdeki tüm yazıları getirir.

---

## 🗂️ Kategori İşlemleri

20. **Belirli Kategoriye Ait Blogları Getirme**  
    - **API Metodu:** `GET /posts?category=categoryid`  
    - **Açıklama:** Seçilen kategoriye ait blog yazılarını listeler.
