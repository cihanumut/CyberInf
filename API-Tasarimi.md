# API Tasarımı - OpenAPI Specification Örneği

**OpenAPI Spesifikasyon Dosyası:** [lamine.yaml](lamine.yaml)

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış örnek bir API tasarımını içermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Blog platformu API
  description: |
    Kullanıcıların blog yazıları oluşturabildiği, yorum yapabildiği ve
    kategorilere göre içerik görüntüleyebildiği RESTful API servisidir.
    Sistem JWT tabanlı kimlik doğrulama kullanmaktadır.
    ## Özellikler
    - Kullanıcı yönetimi
    - Blog yazısı yönetimi
    - Yorum işlemleri
    - JWT tabanlı kimlik doğrulama
  version: 1.0.0
  contact:
    name: API Destek Ekibi
    email: api-support@cyberımf.com
    url: https://api.cyberınf.com/support
 
servers:
  - url: https://api.cyberınf.com/v1
    description: Production server
  - url: https://staging-api.cyberınf.com/v1
    description: Staging server
  - url: http://localhost:3000/v1
    description: Development server

tags:
  - name: Authentication
    description: Kullanıcı kimlik doğrulama işlemleri
  - name: Users
    description: Kullanıcı işlemleri
  - name: Blogs
    description: Blog yazısı işlemleri
  - name: Comments
    description: Yorum işlemleri
  - name: Categories
    description: Blog kategorileri işlemleri

paths:

  /auth/register:
    post:
      tags:
        - Authentication
      summary: Kullanıcı Kaydı
      description: Yeni kullanıcı oluşturur
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterInput'
      responses:
        "201":
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

        "409":
          description: Email zaten kayıtlı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
                
  /auth/login:
    post:
      tags:
        - Authentication
      summary: Kullanıcı Girişi
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginInput'
      responses:
        "200":
          description: Başarılı giriş
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

         "400":
          description: Eksik veya hatalı veri
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

        "401":
          description: Email veya şifre hatalı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/password-reset:
    post:
      tags:
        - Authentication
      summary: Şifre sıfırlama isteği
      responses:
        "200":
          description: Şifre sıfırlama maili gönderildi

  /auth/password-reset/confirm:
    post:
      tags:
        - Authentication
      summary: Yeni şifre belirleme
      responses:
        "200":
          description: Şifre başarıyla güncellendi

  /auth/logout:
    post:
      tags:
        - Authentication
      summary: Çıkış yapma
      responses:
        "200":
          description: Kullanıcı çıkış yaptı


  /users/{userId}:
    parameters:
      - name: userId
        in: path
        required: true
        schema:
          type: string

    get:
      tags:
        - Users
      summary: Profil görüntüleme
      responses:
        "200":
          description: Kullanıcı bilgileri
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

    put:
      tags:
        - Users
      summary: Profil güncelleme
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdateInput'
      responses:
        "200":
          description: Profil güncellendi

    delete:
      tags:
        - Users
      summary: Hesap silme
      responses:
        "204":
          description: Kullanıcı silindi


  /users/{userId}/blogs:
    get:
      tags:
        - Users
      summary: Kullanıcının bloglarını listeleme
      responses:
        "200":
          description: Blog listesi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Blog'


  /blogs:
    post:
      tags:
        - Blogs
      summary: Blog yazısı ekleme
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BlogInput'
      responses:
        "201":
          description: Blog oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Blog'


  /blogs/{blogId}:
    parameters:
      - name: blogId
        in: path
        required: true
        schema:
          type: string

    put:
      tags:
        - Blogs
      summary: Blog düzenleme
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BlogInput'
      responses:
        "200":
          description: Blog güncellendi

    delete:
      tags:
        - Blogs
      summary: Blog silme
      responses:
        "204":
          description: Blog silindi
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

        "403":
          description: Bu blogu silme yetkiniz yok
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

        "404":
          description: Blog bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'


  /blogs/{blogId}/comments:
    parameters:
      - name: blogId
        in: path
        required: true
        schema:
          type: string

    post:
      tags:
        - Comments
      summary: Bloga yorum ekleme
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CommentInput'
      responses:
        "201":
          description: Yorum eklendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Comment'


  /comments:
    get:
      tags:
        - Comments
      summary: Onay bekleyen yorumları listele
      parameters:
        - name: status
          in: query
          required: true
          schema:
            type: string
            example: pending
      responses:
        "200":
          description: Yorum listesi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Comment'


  /comments/{commentId}:
    parameters:
      - name: commentId
        in: path
        required: true
        schema:
          type: string

    put:
      tags:
        - Comments
      summary: Yorum güncelleme
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CommentInput'
      responses:
        "200":
          description: Yorum güncellendi

    delete:
      tags:
        - Comments
      summary: Yorum silme
      responses:
        "204":
          description: Yorum silindi


  /categories:
    get:
      tags:
        - Categories
      summary: Kategori listeleme
      responses:
        "200":
          description: Kategori listesi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Category'


  /categories/{categoryId}/blogs:
    parameters:
      - name: categoryId
        in: path
        required: true
        schema:
          type: string

    get:
      tags:
        - Categories
      summary: Kategoriye ait blogları getir
      responses:
        "200":
          description: Blog listesi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Blog'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token ile kimlik doğrulama

  parameters:
    UserIdParam:
      name: userId
      in: path
      required: true
      description: Kullanıcı ID'si
      schema:
        type: string
        format: uuid
    
    ProductIdParam:
      name: productId
      in: path
      required: true
      description: Ürün ID'si
      schema:
        type: string
        format: uuid
    
    PageParam:
      name: page
      in: query
      description: Sayfa numarası
      schema:
        type: integer
        minimum: 1
        default: 1
    
    LimitParam:
      name: limit
      in: query
      description: Sayfa başına kayıt sayısı
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

  schemas:
     RegisterInput:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
        password:
          type: string
      required:
        - name
        - email
        - password

    LoginInput:
      type: object
      properties:
        email:
          type: string
        password:
          type: string
      required:
        - email
        - password

    AuthResponse:
      type: object
      properties:
        token:
          type: string

    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
        phone:
          type: string

    UserUpdateInput:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
        phone:
          type: string

    Blog:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        content:
          type: string
        author:
          type: string
        categoryId:
          type: string
        createdAt:
          type: string
          format: date-time

    BlogInput:
      type: object
      properties:
        title:
          type: string
        content:
          type: string
        categoryId:
          type: string
      required:
        - title
        - content
        - categoryId

    Comment:
      type: object
      properties:
        id:
          type: string
        blogId:
          type: string
        author:
          type: string
        text:
          type: string
        status:
          type: string
          enum: [pending, approved]
        createdAt:
          type: string
          format: date-time

    CommentInput:
      type: object
      properties:
        text:
          type: string
      required:
        - text

    Category:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
          description: Hata kodu
          example: "VALIDATION_ERROR"
        message:
          type: string
          description: Hata mesajı
          example: "Geçersiz email adresi"
        details:
          type: array
          description: Detaylı hata bilgileri
          items:
            type: object
            properties:
              field:
                type: string
                example: "email"
              message:
                type: string
                example: "Email formatı geçersiz"

  responses:
    BadRequest:
      description: Geçersiz istek
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "BAD_REQUEST"
            message: "İstek parametreleri geçersiz"
    
    Unauthorized:
      description: Yetkisiz erişim
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "UNAUTHORIZED"
            message: "Kimlik doğrulama başarısız"
    
    NotFound:
      description: Kaynak bulunamadı
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "NOT_FOUND"
            message: "İstenen kaynak bulunamadı"
    
    Forbidden:
      description: Erişim reddedildi
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "FORBIDDEN"
            message: "Bu işlem için yetkiniz bulunmamaktadır"
``
