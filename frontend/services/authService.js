import api from '../lib/api';

const authService = {
    login: async (phone, password) => {
        const response = await api.post('/auth/login', {
            phone,
            password,
        });

        return response.data;
    },

    register: async (username, phone, password) => {
        const response = await api.post('/auth/register', {
            username,
            phone,
            password,
        });

        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    resetPassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/reset-password', {
            currentPassword,
            newPassword,
        });

        return response.data;
    },
};

export default authService;