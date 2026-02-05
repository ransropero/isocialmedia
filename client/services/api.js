import axios from 'axios';

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost') {
            // Se estiver em produção e sem variável de ambiente, assume-se que o backend 
            // está disponível no mesmo host sob o path /api (via proxy) ou na porta 5001.
            // Para Cloud Run com container único, geralmente precisa de uma URL completa ou proxy.
            return window.location.origin + '/api';
        }
    }
    return 'http://localhost:5001/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
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

export const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
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

export default api;
