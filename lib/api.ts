import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Replace with your machine's local IP (e.g., 192.168.x.x) if testing on a physical device
// For Android Emulator, use 'http://10.0.2.2:8000/api'
// For iOS Simulator or Web, use 'http://127.0.0.1:8000/api'
const BASE_URL = 'http://192.168.195.249:8000/api';

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

export default api;
