import api from '../lib/api';

const accountService = {
    getMyAccount: async () => {
        const response = await api.get('/accounts/me');
        return response.data;
    },

    getUserAccount: async (userId) => {
        const response = await api.get(`/accounts/${userId}`);
        return response.data;
    },

    createAccount: async (user_id, initial_deposit) => {
        const response = await api.post('/accounts', {
            user_id,
            initial_deposit,
        });

        return response.data;
    },

    deactivateAccount: async (accountNumber) => {
        const response = await api.put(
            `/accounts/deactivate/${accountNumber}`
        );

        return response.data;
    },
};

export default accountService;