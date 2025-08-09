import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            // console.log('Auth header:', config.headers.Authorization); // Debug line

        } else {
            console.warn("No Token Found in localStorage")
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                window.location.href = '/';
            }
            else if (error.response.status === 500) {
                console.error('Server error:', error.response.data);
            }
        }
        else if (error.code === 'ECONNABORTED') {
            console.error('Request Timeout:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
