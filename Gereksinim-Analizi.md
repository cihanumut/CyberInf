# Gereksinim Analizi

Aşağıda uygulamaya ait gereksinim analizi yapılıp listelenmiştir.

# Tüm Gereksinimler 

## 🔐 Authentication İşlemleri

1. **Üye Olma** (Cihan Umut Çolak)
 - **API Metodu:** `POST /auth/register`
 - **Açıklama:** Kullanıcıların yeni hesap oluşturmasını sağlar. Email ve şifre ile kayıt yapılır.

2. **Giriş Yapma** (Cihan Umut Çolak)
 - **API Metodu:** `POST /auth/login`
 - **Açıklama:** Kayıtlı kullanıcıların sisteme giriş yapmasını sağlar. Başarılı giriş sonrası JWT token döndürülür.

3. **Şifre Sıfırlama** (Cihan Umut Çolak)
 - **API Metodu:** `POST /auth/password-reset`
 - **Açıklama:** Kullanıcının email adresine şifre sıfırlama linki gönderilir.

4. **Şifre Sıfırlama Onayı** (Cihan Umut Çolak)
 - **API Metodu:** `POST /auth/password-reset/confirm`
 - **Açıklama:** Kullanıcı token ile yeni şifre belirler.

5. **Çıkış yapma** (Cihan Umut Çolak)
 - **API Metodu:** `POST /auth/logout`
 - **Açıklama:** Kullanıcının sistemden güvenli şekilde çıkış yapmasını sağlar. JWT tabanlı sistemlerde genellikle client tarafında token silinir. Eğer sistemde token blacklist yapısı varsa, token geçersiz hale getirilir.

---

## 👤 Kullanıcı İşlemleri

6. **Profil Görüntüleme** (Cihan Umut Çolak)
 - **API Metodu:** `GET /users/{userId}`
 - **Açıklama:** Kullanıcının profil bilgilerini görüntüler. Giriş yapılmış olmalıdır.

7. **Profil Güncelleme**  (Cihan Umut Çolak)
 - **API Metodu:** `PUT /users/{userId}`
 - **Açıklama:** Kullanıcının ad, soyad, email, telefon gibi bilgilerini günceller. Kullanıcı sadece kendi bilgilerini güncelleyebilir.
  
8. **Hesap Silme**  (Cihan Umut Çolak)
 - **API Metodu:** `DELETE /users/{userId}`
 - **Açıklama:** Kullanıcı hesabını kalıcı olarak siler. İşlem geri alınamaz.

9. **Kullanıcının Bloglarını Listeleme**  (Cihan Umut Çolak)
 - **API Metodu:** `GET /users/{userId}/blogs`
 - **Açıklama:** Kullanıcının eklediği blog yazılarını listeler. Admin tüm kullanıcıları görüntüleyebilir.
   
---

## 💬 Yorum İşlemleri

10. **Yorum Ekleme**  (Cihan Umut Çolak)
    - **API Metodu:** `POST /blogs/{blogId}/comments`  
    - **Açıklama:** Belirli bir blog yazısına yorum ekler. Giriş yapılmış olmalıdır..

11. **Onay Bekleyen Yorum Listeleme(Admin)**  (Cihan Umut Çolak)
    - **API Metodu:** `GET /comments?status=pending`  
    - **Açıklama:** Adminlerin onay bekleyen yorumları listelemesini sağlar.

12. **Yorum Güncelleme**  (Cihan Umut Çolak)
    - **API Metodu:** `PUT /comments/{commentId}`  
    - **Açıklama:** Kullanıcı kendi yorumunu düzenleyebilir. Admin tüm yorumları düzenleyebilir.

13. **Yorum Silme**  (Cihan Umut Çolak)
    - **API Metodu:** `DELETE /comments/{commentId}`  
    - **Açıklama:** Kullanıcı kendi yorumunu silebilir. Admin tüm yorumları silebilir.

---

## 📝 Blog İşlemleri


14. **Blog Yazısı Ekleme** (Cihan Umut Çolak)  
    - **API Metodu:** `POST /blogs`
    - **Açıklama:** Yeni blog yazısı ekler. Giriş yapılmış olmalıdır.

15. **Blog Yazısı Düzenleme**  (Cihan Umut Çolak)
    - **API Metodu:** `PUT /blogs/{blogId}`  
    - **Açıklama:** Kullanıcı kendi blogunu düzenleyebilir. Admin tüm blogları düzenleyebilir.

16. **Blog Yazısı Silme**  (Cihan Umut Çolak)
    - **API Metodu:** `DELETE /blogs/{blogId}`  
    - **Açıklama:** Kullanıcı kendi blogunu silebilir. Admin tüm blogları silebilir.

---

## 🗂️ Kategori İşlemleri

17. **Kategori Listeleme**  (Cihan Umut Çolak)
    - **API Metodu:** `GET /categories`  
    - **Açıklama:** Sistemdeki tüm blog kategorilerini listeler. 

18. **Belirli Kategoriye Ait Blogları Getirme**  (Cihan Umut Çolak)
    - **API Metodu:** `GET /categories/{categoryId}/blogs`  
    - **Açıklama:** Seçilen kategoriye ait blog yazılarını listeler.

# Gereksinim Dağılımları
1. [Cihan Umut Çolak'ın Gereksinimleri](Cihan-Umut-Çolak/Cihan-Umut-Çolak-Gereksinimler.md)
