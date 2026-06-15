import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://ecommerce-api-da4o.onrender.com').replace(/\/$/, '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const recentlyViewedApi = {
    add: (productId) => apiClient.post(`/recently-viewed/add/${productId}`),
    get: () => apiClient.get('/recently-viewed/')
};

export default apiClient;
