import axios from 'axios';

// O baseURL agora é relativo para usar o proxy do Next.js (configurado em next.config.mjs)
// Isso permite que o app funcione em qualquer URL de deploy sem configurações fixas.
const api = axios.create({
    baseURL: '/api',
});

// Auth Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (email, password, fullName, birthDate, cpf, optIn) => {
    const response = await api.post('/auth/register', { email, password, fullName, birthDate, cpf, optIn });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get('/auth/users');
    return response.data;
};

export const updateUserAccess = async (id, hasAccess) => {
    const response = await api.put(`/auth/users/${id}/access`, { hasAccess });
    return response.data;
};

export const updateUserPlan = async (id, plan) => {
    const response = await api.put(`/auth/users/${id}/plan`, { plan });
    return response.data;
};

// Posts
export const getPosts = () => api.get('/posts');
export const createPost = (formData) => api.post('/posts', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);

// Accounts
export const getAccounts = () => api.get('/accounts');
export const createAccount = (data) => api.post('/accounts', data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

// Bio Pages
export const getMyBioPages = () => api.get('/bio/my');
export const getBioPageBySlug = (slug) => api.get(`/bio/slug/${slug}`);
export const createBioPage = (data) => api.post('/bio', data);
export const updateBioPage = (id, data) => api.put(`/bio/${id}`, data);
export const deleteBioPage = (id) => api.delete(`/bio/${id}`);
export const uploadBioImage = (formData) => api.post('/bio/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const trackBioClick = (id, linkIndex) => api.post(`/bio/${id}/click`, { linkIndex });
export const trackBioVisit = (id, source, referrer) => api.post(`/bio/${id}/visit`, { source, referrer });
export const verifyLinkPassword = (id, linkIndex, password) => api.post(`/bio/${id}/verify-password`, { linkIndex, password });
export const getBioAnalytics = (id, range = 'month') => api.get(`/bio/${id}/analytics?range=${range}`);

export default api;
