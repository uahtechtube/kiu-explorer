import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from '../lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
    reg_no?: string; // Registration number for students
    permissions?: string[]; // Added for role-based access control
    gender?: string;
    phone_number?: string;
    state_of_origin?: string;
    lga?: string;
    passport_photograph?: string;
    residential_address?: string;
    student_profile?: {
        faculty?: { name: string };
        department?: { name: string };
        level?: string;
        guardian_name?: string;
        guardian_phone?: string;
    };
    lecturer_profile?: {
        faculty?: { name: string };
        department?: { name: string };
        office_location?: string;
        office_hours?: string;
        specialization?: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (token: string | null, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    forceLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Web polyfill for SecureStore
const storage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const storedToken = await storage.getItem('token');
            const storedUser = await storage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    }

    const signIn = async (newToken: string | null, newUser: User) => {
        if (newToken) {
            await storage.setItem('token', newToken);
            setToken(newToken);
        }
        await storage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    const signOut = async () => {
        await storage.deleteItem('token');
        await storage.deleteItem('user');
        setToken(null);
        setUser(null);
    };

    const forceLogout = async () => {
        // Force logout without API call (for token expiration/401 errors)
        await storage.deleteItem('token');
        await storage.deleteItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, forceLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
