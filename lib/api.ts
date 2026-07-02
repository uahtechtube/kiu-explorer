import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// API Base URL Configuration
// IMPORTANT: Update YOUR_COMPUTER_IP with your actual local IP address
// To find your IP: Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
// Look for IPv4 Address under your active network adapter (e.g., 192.168.1.10)

// Set this to true to connect to your live hosted server, or false for local development
const USE_PRODUCTION = true;

const YOUR_COMPUTER_IP = '192.168.115.249'; // UPDATE THIS with your actual IP if different

const getBaseUrl = () => {
    if (USE_PRODUCTION) {
        return 'http://explorer.kiu.edu.ng/public/api';
    }

    if (Platform.OS === 'web') {
        return 'http://localhost:8000/api';
    } else if (Platform.OS === 'android') {
        // For Android Emulator, use 10.0.2.2
        // return 'http://10.0.2.2:8000/api';

        // For Physical Android Device:
        return `http://${YOUR_COMPUTER_IP}:8000/api`;
    } else if (Platform.OS === 'ios') {
        return `http://${YOUR_COMPUTER_IP}:8000/api`;
    }
    return 'http://localhost:8000/api';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    let token;
    if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
    } else {
        token = await SecureStore.getItemAsync('token');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            if (Platform.OS === 'web') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                await SecureStore.deleteItemAsync('token');
                await SecureStore.deleteItemAsync('user');
            }
            // Note: The AuthContext will detect the missing token on next check
            // and redirect to login via the root layout
        }

        // Log detailed server error responses only for critical server crashes (500+)
        // Client errors (e.g. 401, 422) are logged cleanly without triggering blocking developer RedBox overlays
        if (error.response && error.response.data) {
            const status = error.response.status;
            if (status >= 500) {
                console.error('\n❌ SERVER ERROR RESPONSE:');
                console.error(JSON.stringify(error.response.data, null, 2));
            } else {
                console.log(`ℹ️ API Client Request Error (${status}):`, error.response.data.message || error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
