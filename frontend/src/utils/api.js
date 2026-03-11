import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Request interceptor - token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) { localStorage.clear(); window.location.href = '/login'; return Promise.reject(error); }
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth servisleri (/auth/*) ─────────────────────────
export const authService = {
  register:              (data)  => api.post('/auth/register', data),
  login:                 (data)  => api.post('/auth/login', data),
  logout:                ()      => api.post('/auth/logout'),
  getMe:                 ()      => api.get('/auth/me'),
  refreshToken:          (token) => api.post('/auth/refresh-token', { refreshToken: token }),
  passwordResetRequest:  (email) => api.post('/auth/password-reset', { email }),
  passwordResetConfirm:  (data)  => api.post('/auth/password-reset/confirm', data),
  verifyEmail: (token, email) => api.get(`/auth/verify-email?token=${token}&email=${email}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// ── Kullanıcı servisleri (/users/:userId) ─────────────
export const userService = {
  getUser:      (userId)       => api.get(`/users/${userId}`),
  updateUser:   (userId, data) => api.put(`/users/${userId}`, data),
  deleteUser:   (userId)       => api.delete(`/users/${userId}`),
  getUserBlogs: (userId, params) => api.get(`/users/${userId}/blogs`, { params }),
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
};

// ── Blog servisleri (/blogs) ──────────────────────────
export const blogService = {
  getBlogs:     (params)         => api.get('/blogs', { params }),
  getBlog:      (blogId)         => api.get(`/blogs/${blogId}`),
  createBlog:   (data)           => api.post('/blogs', data),
  updateBlog:   (blogId, data)   => api.put(`/blogs/${blogId}`, data),
  deleteBlog:   (blogId)         => api.delete(`/blogs/${blogId}`),
  toggleLike: (blogId) => api.post(`/blogs/${blogId}/like`),
};

// ── Yorum servisleri (/blogs/:blogId/comments & /comments) ──
export const commentService = {
  createComment:  (blogId, data)      => api.post(`/blogs/${blogId}/comments`, data),
  getComments:    (params)            => api.get('/comments', { params }),          // GET /comments?status=pending
  updateComment:  (commentId, data)   => api.put(`/comments/${commentId}`, data),  // PUT /comments/:commentId
  deleteComment:  (commentId)         => api.delete(`/comments/${commentId}`),      // DELETE /comments/:commentId
  toggleCommentLike: (blogId, commentId) => api.post(`/blogs/${blogId}/comments/${commentId}/like`),
};

// ── Kategori servisleri (/categories) ────────────────
export const categoryService = {
  getCategories:   ()              => api.get('/categories'),
  getCategoryBlogs:(categoryId, params) => api.get(`/categories/${categoryId}/blogs`, { params }),
  createCategory:  (data)          => api.post('/categories', data),
  deleteCategory:  (categoryId)    => api.delete(`/categories/${categoryId}`)
};

// ── Upload servisi ────────────────────────────────────
export const uploadService = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id) => api.put(`/notifications/${id}/read`)
};
export default api;
