import axios from 'axios';

// O baseURL agora é relativo para usar o proxy do Next.js (configurado em next.config.mjs)
// Isso permite que o app funcione em qualquer URL de deploy sem configurações fixas.
const apiClient = axios.create({
    baseURL: '/api',
});

// Auth Interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (email, password, fullName, birthDate, cpf, optIn) => {
    const response = await apiClient.post('/auth/register', { email, password, fullName, birthDate, cpf, optIn });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};

export const getUsers = async () => {
    const response = await apiClient.get('/auth/users');
    return response.data;
};

export const updateUserAccess = async (id, hasAccess) => {
    const response = await apiClient.put(`/auth/users/${id}/access`, { hasAccess });
    return response.data;
};

export const updateUserPlan = async (id, plan) => {
    const response = await apiClient.put(`/auth/users/${id}/plan`, { plan });
    return response.data;
};

// Posts
export const getPosts = () => apiClient.get('/posts');
export const createPost = (formData) => apiClient.post('/posts', formData);
export const deletePost = (id) => apiClient.delete(`/posts/${id}`);
export const updatePost = (id, data) => apiClient.put(`/posts/${id}`, data);

// Accounts
export const getAccounts = () => apiClient.get('/accounts');
export const createAccount = (data) => apiClient.post('/accounts', data);
export const deleteAccount = (id) => apiClient.delete(`/accounts/${id}`);

// Bio Pages
export const getMyBioPages = () => apiClient.get('/bio/my');
export const getBioPageBySlug = (slug) => apiClient.get(`/bio/slug/${slug}`);
export const createBioPage = (data) => apiClient.post('/bio', data);
export const updateBioPage = (id, data) => apiClient.put(`/bio/${id}`, data);
export const deleteBioPage = (id) => apiClient.delete(`/bio/${id}`);
export const uploadBioImage = (formData) => apiClient.post('/bio/upload', formData);
export const trackBioClick = (id, linkIndex) => apiClient.post(`/bio/${id}/click`, { linkIndex });
export const trackBioVisit = (id, source, referrer, metadata = {}) => apiClient.post(`/bio/${id}/visit`, { source, referrer, ...metadata });
export const verifyLinkPassword = (id, linkIndex, password) => apiClient.post(`/bio/${id}/verify-password`, { linkIndex, password });
export const getBioAnalytics = (id, range = 'month') => apiClient.get(`/bio/${id}/analytics?range=${range}`);
export const importLinktree = (url) => apiClient.post('/bio/import-linktree', { url });

// WhatsApp
export const getWhatsAppStatus = () => apiClient.get('/whatsapp/status');
export const getWhatsAppQR = () => apiClient.get('/whatsapp/qr');
export const logoutWhatsApp = () => apiClient.post('/whatsapp/logout');
export const getWhatsAppSettings = () => apiClient.get('/whatsapp/settings');
export const updateWhatsAppSettings = (data) => apiClient.post('/whatsapp/settings', data);
export const getWhatsAppContacts = () => apiClient.get('/whatsapp/contacts');
export const addWhatsAppContact = (data) => apiClient.post('/whatsapp/contacts', data);
export const updateWhatsAppContact = (id, data) => apiClient.put(`/whatsapp/contacts/${id}`, data);
export const deleteWhatsAppContact = (id) => apiClient.delete(`/whatsapp/contacts/${id}`);
export const importWhatsAppContacts = (contacts) => apiClient.post('/whatsapp/contacts/import', { contacts });
export const getWhatsAppCampaigns = () => apiClient.get('/whatsapp/campaigns');
export const createWhatsAppCampaign = (formData) => apiClient.post('/whatsapp/campaigns', formData);
export const updateWhatsAppCampaign = (id, formData) => apiClient.put(`/whatsapp/campaigns/${id}`, formData);
export const deleteWhatsAppCampaign = (id) => apiClient.delete(`/whatsapp/campaigns/${id}`);
export const getWhatsAppCampaignAudience = (id) => apiClient.get(`/whatsapp/campaigns/${id}/audience`);
export const removeWhatsAppContactFromCampaign = (id, contactId) => apiClient.delete(`/whatsapp/campaigns/${id}/audience/${contactId}`);
export const getWhatsAppCampaignReport = (id) => apiClient.get(`/whatsapp/campaigns/${id}/report`);

// Site Analytics (Admin)
export const getSiteAnalytics = (range = 'month') => apiClient.get(`/site-analytics?range=${range}`);
export const trackSiteVisit = (path, source, referrer) => apiClient.post('/site-analytics/track', { path, source, referrer });

// Stripe
export const createStripeCheckoutSession = (plan) => apiClient.post('/stripe/checkout', { plan });
export const createStripePortalSession = () => apiClient.post('/stripe/portal');

// Account Deletion
export const deleteUserAccount = () => apiClient.delete('/auth/delete-account');

export const verifyStripeSubscription = () => apiClient.post('/stripe/verify');

// Short Links
export const getShortLinks = () => apiClient.get('/short-links');
export const createShortLink = (data) => apiClient.post('/short-links', data);
export const updateShortLink = (id, data) => apiClient.put(`/short-links/${id}`, data);
export const deleteShortLink = (id) => apiClient.delete(`/short-links/${id}`);
export const getShortLinkAnalytics = (id) => apiClient.get(`/short-links/${id}/analytics`);
export const resolveShortLink = (shortCode) => apiClient.get(`/short-links/resolve/${shortCode}`);

export default apiClient;
