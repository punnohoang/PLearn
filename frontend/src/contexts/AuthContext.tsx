'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // TODO: decode token để set user (sẽ làm sau)
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const res = await api.post('/auth/login', {
                email: email.toLowerCase().trim(),
                password
            });
            localStorage.setItem('token', res.data.access_token);
            window.location.href = '/courses';
        } catch (err: any) {
            const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
            setError(message);
            console.error('Login error details:', {
                status: err.response?.status,
                message: err.response?.data?.message,
                error: err.response?.data?.error,
                fullError: err.message,
            });
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            setError(null);
            const res = await api.post('/auth/register', {
                email: email.toLowerCase().trim(),
                password,
                name: name.trim()
            });
            localStorage.setItem('token', res.data.access_token);
            window.location.href = '/courses';
        } catch (err: any) {
            const message = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setError(message);
            console.error('Register error details:', {
                status: err.response?.status,
                message: err.response?.data?.message,
                error: err.response?.data?.error,
                fullError: err.message,
            });
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};