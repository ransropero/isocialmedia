import axios from 'axios';

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

export default api;
