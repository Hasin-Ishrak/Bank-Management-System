'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user: userData } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            // Route based on user roles safely
            if (userData.role === 'Admin') router.push('/admin');
            else if (userData.role === 'Employee') router.push('/employee');
            else router.push('/customer');
            
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login sequence failed.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);