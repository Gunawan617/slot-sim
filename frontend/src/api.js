import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

// Auth
export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const getProfile = () => api.get('/user/me');

// Fortune Gems
export const playSlot = (data) => api.post('/user/play-slot', data);
export const getHistory = () => api.get('/user/history');

// Mythic Lightning
export const mythicSpin = (data) => api.post('/api/mythic/spin', data);
export const mythicHistory = () => api.get('/api/mythic/history');

// Wallet
export const requestTopUp = (data) => api.post('/api/wallet/topup', data);
export const requestWithdraw = (data) => api.post('/api/wallet/withdraw', data);
export const getWalletHistory = () => api.get('/api/wallet/history');

// Admin
export const getAdminTransactions = (status) => api.get('/api/admin/transactions', { params: { status } });
export const processTransaction = (id, action) => api.post(`/api/admin/transactions/${id}/process`, { action });
export const getAdminDashboard = () => api.get('/api/admin/dashboard');
