'use client';

import { useEffect, useState } from 'react';
import reportService from '../../../services/reportService';
import { extractList, formatMoney, formatDate } from '../../../lib/normalize';

const STATUS_STYLES = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/40',
    Rejected: 'bg-red-50 text-red-700 border-red-200/40',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/40',
};

export default function LoanPage() {
    const [loans, setLoans] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Floating Notification Popup State
    const [toast, setToast] = useState({ show: false, type: '', text: '' });

    const popNotification = (type, text) => {
        setToast({ show: true, type, text });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 4000);
    };

    const loadLoans = async () => {
        setLoadingData(true);
        try {
            const res = await reportService.getMyLoans();
            setLoans(extractList(res, ['loans']));
        } catch (error) {
            // Keep previous states; fallback handled gracefully
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        loadLoans();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            popNotification('error', 'Loan application failed: Enter a valid loan amount greater than ৳0.00.');
            return;
        }
        if (!reason.trim()) {
            popNotification('error', 'Loan application failed: Please provide a valid justification text.');
            return;
        }

        setSubmitting(true);
        try {
            await reportService.applyLoan(numericAmount, reason.trim());
            popNotification('success', 'Loan application successful!');
            setAmount('');
            setReason('');
            loadLoans();
        } catch (error) {
            const serverMessage = error.response?.data?.message || 'Server connection layout failure.';
            popNotification('error', `Loan application failed: ${serverMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 relative">
            
            {/* DYNAMIC FLOATING NOTIFICATION POPUP */}
            <div
                className={`fixed top-6 right-6 z-50 max-w-sm w-full rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 transform ${
                    toast.show 
                        ? 'translate-y-0 opacity-100 scale-100' 
                        : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
                } ${
                    toast.type === 'success'
                        ? 'border-emerald-500/30 bg-white/95 text-emerald-900 !shadow-[0_10px_30px_rgba(16,185,129,0.15)]'
                        : 'border-red-500/30 bg-white/95 text-red-900 !shadow-[0_10px_30px_rgba(239,68,68,0.15)]'
                }`}
            >
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        toast.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {toast.type === 'success' ? '✓' : '✕'}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                            System Node Alert
                        </h4>
                        <p className="mt-1 text-xs font-semibold text-gray-600 leading-relaxed">
                            {toast.text}
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setToast((prev) => ({ ...prev, show: false }))} 
                        className="text-gray-400 hover:text-gray-600 font-bold text-xs"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-green-950 sm:text-3xl">Credit Loans</h1>
                <p className="mt-1.5 text-sm font-medium text-gray-500">
                    Request a new capital adjustment asset allocation and track the assessment audit logs.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Apply form panel */}
                <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 !shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-emerald-500/20 lg:col-span-1">
                    <h3 className="mb-4 text-md font-bold text-gray-900 tracking-tight">
                        Apply for a Loan
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                Loan Amount (৳)
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="text-xs font-bold text-gray-400">৳</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="5000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-8 pr-4 text-xs font-semibold text-gray-900 transition placeholder:text-gray-300 focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                Reason for Request
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Provide brief contextual justification data for this loan sequence..."
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-900 transition placeholder:text-gray-300 focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 rounded-xl bg-green-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                        >
                            {submitting ? 'Submitting request...' : 'Submit Application'}
                        </button>
                    </form>
                </div>

                {/* Loan status list panel */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 text-md font-bold text-gray-900 tracking-tight">
                        Your Loan Applications
                    </h3>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <th className="pb-3 font-semibold">Amount</th>
                                    <th className="pb-3 font-semibold">Reason Context</th>
                                    <th className="pb-3 font-semibold">Status Badge</th>
                                    <th className="pb-3 font-semibold text-right">Requested</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {loadingData ? (
                                    [...Array(4)].map((_, idx) => (
                                        <tr key={idx} className="animate-pulse">
                                            <td className="py-4"><div className="h-4 w-16 rounded bg-gray-100" /></td>
                                            <td className="py-4"><div className="h-4 w-36 rounded bg-gray-100" /></td>
                                            <td className="py-4"><div className="h-5 w-20 rounded-full bg-gray-100" /></td>
                                            <td className="py-4 text-right"><div className="h-4 w-24 rounded bg-gray-100 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : loans.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-gray-400 font-medium">
                                            No active loan applications recorded on this identity node.
                                        </td>
                                    </tr>
                                ) : (
                                    loans.map((loan, i) => (
                                        <tr key={loan.id || i} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 font-bold text-gray-900 text-sm flex items-center gap-0.5">
                                                <span className="text-gray-400 font-bold text-xs">৳</span>
                                                {formatMoney(loan.amount)}
                                            </td>
                                            <td className="max-w-[220px] truncate py-3.5 text-gray-600 font-medium pr-4">
                                                {loan.reason_for_request || '—'}
                                            </td>
                                            <td className="py-3.5">
                                                <span
                                                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                                        STATUS_STYLES[loan.status] ||
                                                        'bg-gray-100 text-gray-600 border-gray-200/40'
                                                    }`}
                                                >
                                                    {loan.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-right font-mono text-gray-400">
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