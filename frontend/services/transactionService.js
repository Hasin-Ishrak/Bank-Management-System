import api from '../lib/api';

const transactionService = {
    deposit: async (account_number, amount) => {
        const response = await api.post('/transactions/deposit', {
            account_number,
            amount,
        });

        return response.data;
    },

    withdraw: async (account_number, amount) => {
        const response = await api.post('/transactions/withdraw', {
            account_number,
            amount,
        });

        return response.data;
    },

    transfer: async (
        source_account_number,
        target_account_number,
        amount
    ) => {
        const response = await api.post('/transactions/transfer', {
            source_account_number,
            target_account_number,
            amount,
        });

        return response.data;
    },

    getMyTransactions: async () => {
        const response = await api.get(
            '/transactions/history'
        );

        return response.data;
    },

    getAllTransactions: async () => {
        const response = await api.get(
            '/transactions/all'
        );

        return response.data;
    },
};

export default transactionService;