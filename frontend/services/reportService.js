import api from '../lib/api';

const reportService = {
    applyLoan: async (amount, reason_for_request) => {
        const response = await api.post('/reports/loan', {
            amount,
            reason_for_request,
        });

        return response.data;
    },

    getMyLoans: async () => {
        const response = await api.get(
            '/reports/loan/me'
        );

        return response.data;
    },

    getAllLoans: async () => {
        const response = await api.get(
            '/reports/loan'
        );

        return response.data;
    },

    updateLoanStatus: async (loanId, status) => {
        const response = await api.put(
            `/reports/loan/${loanId}`,
            {
                status,
            }
        );

        return response.data;
    },

    getSystemReports: async () => {
        const response = await api.get(
            '/reports/system'
        );

        return response.data;
    },
};

export default reportService;