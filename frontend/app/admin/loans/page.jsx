'use client';

import { useEffect, useState } from 'react';
import reportService from '../../../services/reportService';
import { extractList, extractData, formatMoney, formatDate } from '../../../lib/normalize';

const STATUS_STYLES = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-700',
    Pending: 'bg-amber-100 text-amber-700',
};

export default function AdminLoansPage() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('All');

    const loadLoans = async () => {
        setLoading(true);
        try {
            const res = await reportService.getAllLoans();
            setLoans(extractList(extractData(res) ?? res, ['loans']));
        } catch (error) {
            setNotification({ type: 'error', text: 'Failed to load loan applications.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadLoans();
    }, []);

    const handleUpdate = async (loanId, status) => {
        setNotification({ type: '', text: '' });
        setActionLoading(true);
        try {
            await reportService.updateLoanStatus(loanId, status);
            setNotification({ type: 'success', text: `Loan application ${status.toLowerCase()}.` });
            loadLoans();
        } catch (error) {
            setNotification({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update loan status.',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const filteredLoans = filter === 'All' ? loans : loans.filter((l) => l.status === filter);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-green-950">Loan Applications</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review and act on customer loan requests.
                    </p>
                </div>

                <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                    {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                filter === f ? 'bg-green-900 text-white shadow' : 'text-gray-600 hover:bg-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {notification.text && (
                <div
                    className={`mb-6 rounded-lg border px-4 py-3 text-sm font-semibold ${
                        notification.type === 'success'
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : 'border-red-300 bg-red-50 text-red-600'
                    }`}
                >
                    {notification.text}
                </div>
            )}

            <div className="rounded-2xl bg-white p-6 shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-400">
                                <th className="pb-3 font-medium">Applicant</th>
                                <th className="pb-3 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Reason</th>
                                <th className="pb-3 font-medium">Requested</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="py-6 text-center text-gray-400">Loading...</td></tr>
                            ) : filteredLoans.length === 0 ? (
                                <tr><td colSpan="6" className="py-6 text-center text-gray-400">No loan applications found.</td></tr>
                            ) : (
                                filteredLoans.map((loan, i) => (
                                    <tr key={loan.id || i} className="text-gray-700 hover:bg-gray-50">
                                        <td className="py-3 font-medium">{loan.username || '—'}</td>
                                        <td className="py-3 font-semibold text-gray-900">${formatMoney(loan.amount)}</td>
                                        <td className="max-w-[240px] truncate py-3 text-gray-600">{loan.reason_for_request || '—'}</td>
                                        <td className="py-3 font-mono text-xs text-gray-400">{formatDate(loan.created_at)}</td>
                                        <td className="py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {loan.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            {loan.status === 'Pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={() => handleUpdate(loan.id, 'Approved')}
                                                        className="rounded bg-green-700 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={() => handleUpdate(loan.id, 'Rejected')}
                                                        className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs italic text-gray-400">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
