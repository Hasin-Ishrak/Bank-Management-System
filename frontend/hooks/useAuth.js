'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await authService.getProfile();

                setUser(userData);
                localStorage.setItem(
                    'user',
                    JSON.stringify(userData)
                );
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (phone, password) => {
        try {
            const data = await authService.login(
                phone,
                password
            );

            localStorage.setItem('token', data.token);
            localStorage.setItem(
                'user',
                JSON.stringify(data.user)
            );

            setUser(data.user);

            switch (data.user.role) {
                case 'Admin':
                    router.replace('/admin');
                    break;

                case 'Employee':
                    router.replace('/employee');
                    break;

                default:
                    router.replace('/');
            }

            return {
                success: true,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    'Login failed.',
            };
        }
    };

    const register = async (
        username,
        phone,
        password
    ) => {
        try {
            const data = await authService.register(
                username,
                phone,
                password
            );

            return {
                success: true,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    'Registration failed.',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);

        router.replace('/login');
    };

    const refreshUser = async () => {
        try {
            const userData =
                await authService.getProfile();

            setUser(userData);

            localStorage.setItem(
                'user',
                JSON.stringify(userData)
            );

            return userData;
        } catch (error) {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                refreshUser,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);