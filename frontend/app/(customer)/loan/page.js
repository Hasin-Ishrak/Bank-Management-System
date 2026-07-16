'use client';

import { useEffect, useState } from 'react';
import reportService from '../../../services/reportService';
import { extractList, formatMoney, formatDate } from '../../../lib/normalize';

const STATUS_STYLES = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-700',
    Pending: 'bg-amber-100 text-amber-700',
};

export default function LoanPage() {
    const [loans, setLoans] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const loadLoans = async () => {
        setLoadingData(true);
        try {
            const res = await reportService.getMyLoans();
            setLoans(extractList(res, ['loans']));
        } catch (error) {
            // keep previous state; surfaced via message on submit flows
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadLoans();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            setMessage({ type: 'error', text: 'Enter a valid loan amount greater than 0.' });
            return;
        }
        if (!reason.trim()) {
            setMessage({ type: 'error', text: 'Please provide a reason for the loan request.' });
            return;
        }

        setSubmitting(true);
        try {
            await reportService.applyLoan(numericAmount, reason.trim());
            setMessage({ type: 'success', text: 'Loan application submitted for review.' });
            setAmount('');
            setReason('');
            loadLoans();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to submit loan application.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold text-green-950">Loans</h1>
            <p className="mt-1 text-sm text-gray-500">
                Request a new loan and track the status of your applications.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Apply form */}
                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-1 h-fit">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Apply for a Loan
                    </h3>

                    {message.text && (
                        <div
                            className={`mb-4 rounded-lg border px-3 py-2 text-xs font-semibold ${
                                message.type === 'success'
                                    ? 'border-green-300 bg-green-50 text-green-700'
                                    : 'border-red-300 bg-red-50 text-red-600'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Loan Amount ($)
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Reason for Request
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Briefly explain what this loan is for"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-green-900 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-600"
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>

                {/* Loan status list */}
                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Your Loan Applications
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-400">
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Reason</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Requested</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingData ? (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-gray-400">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : loans.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-gray-400">
                                            You haven&apos;t applied for any loans yet.
                                        </td>
                                    </tr>
                                ) : (
                                    loans.map((loan, i) => (
                                        <tr key={loan.id || i} className="text-gray-700">
                                            <td className="py-3 font-semibold text-gray-900">
                                                ${formatMoney(loan.amount)}
                                            </td>
                                            <td className="max-w-[220px] truncate py-3 text-gray-600">
                                                {loan.reason_for_request || '—'}
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                        STATUS_STYLES[loan.status] ||
                                                        'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {loan.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-3 font-mono text-xs text-gray-400">
                                                {formatDate(loan.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
