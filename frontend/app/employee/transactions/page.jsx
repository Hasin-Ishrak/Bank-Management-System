'use client';

import { useEffect, useState } from 'react';
import transactionService from '../../../services/transactionService';
import { extractList, extractData, formatMoney, formatDate } from '../../../lib/normalize';

const TX_AMOUNT_STEP = 500;

export default function EmployeeTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [targetAccount, setTargetAccount] = useState('');
    const [txType, setTxType] = useState('Deposit');
    const [txAmount, setTxAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Popup toast state configuration
    const [toast, setToast] = useState({ show: false, type: '', text: '' });

    const loadTransactions = async () => {
        setLoadingData(true);
        try {
            const res = await transactionService.getAllTransactions();
            setTransactions(extractList(extractData(res) ?? res, ['transactions']));
        } catch (error) {
            // non-fatal for the form
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    // Handles the automatic auto-dismiss timer whenever a new toast is spawned
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show, toast.text, toast.type]);

    const triggerToast = (type, text) => {
        setToast({ show: true, type, text });
    };

    const adjustAmount = (delta) => {
        setTxAmount((prev) => {
            const current = parseFloat(prev) || 0;
            const next = Math.max(0, current + delta);
            return next === 0 ? '' : Math.round(next * 100) / 100 + '';
        });
    };

    const handleCounterTransaction = async (e) => {
        e.preventDefault();

        const numericAmount = parseFloat(txAmount);
        if (!targetAccount.trim()) {
            triggerToast('error', 'Enter the customer account number.');
            return;
        }
        if (!numericAmount || numericAmount <= 0) {
            triggerToast('error', 'Enter a valid amount greater than 0.');
            return;
        }

        setSubmitting(true);
        try {
            if (txType === 'Deposit') {
                await transactionService.deposit(targetAccount.trim(), numericAmount);
            } else {
                await transactionService.withdraw(targetAccount.trim(), numericAmount);
            }
            triggerToast('success', `Counter ${txType.toLowerCase()} processed successfully.`);
            setTargetAccount('');
            setTxAmount('');
            loadTransactions();
        } catch (error) {
            triggerToast(
                'error',
                error.response?.data?.message || 'Transaction failed. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
            
            {/* Floating Right-Side Popup Toast Notification System */}
            {toast.show && (
                <div 
                    className={`fixed top-6 right-6 z-50 flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 transition-all duration-300 transform translate-x-0 ${
                        toast.type === 'success'
                            ? 'border-green-100 !shadow-[0_10px_30px_rgba(6,78,59,0.12)]'
                            : 'border-red-100 !shadow-[0_10px_30px_rgba(220,38,38,0.12)]'
                    }`}
                >
                    {/* Dynamic Status Icon */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        toast.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                        {toast.type === 'success' ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>

                    {/* Notification Text Content */}
                    <div className="flex-1 pt-0.5">
                        <p className="text-sm font-bold text-gray-900">
                            {toast.type === 'success' ? 'Transaction Completed' : 'Transaction Failed'}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-gray-500 leading-relaxed">
                            {toast.text}
                        </p>
                    </div>

                    {/* Manual Close Action Button */}
                    <button
                        onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                        className="text-gray-400 hover:text-gray-600 transition p-0.5 rounded-lg hover:bg-gray-50"
                        aria-label="Dismiss notification"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <h1 className="text-2xl font-bold text-green-950">Counter Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">
                Process customer deposits and withdrawals over the counter.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Form Card (Interactive Hover Glow) */}
                <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 lg:col-span-1 transition-all duration-200 !shadow-[0_4px_20px_rgba(6,78,59,0.07)] hover:!shadow-[0_12px_32px_rgba(16,185,129,0.18)] hover:!border-emerald-600/30">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Process Transaction
                    </h3>

                    <form onSubmit={handleCounterTransaction} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Account Number
                            </label>
                            <input
                                type="text"
                                required
                                value={targetAccount}
                                onChange={(e) => setTargetAccount(e.target.value)}
                                placeholder="Customer account number"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm outline-none transition focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-900/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Operation
                            </label>
                            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-1 border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setTxType('Deposit')}
                                    className={`rounded-lg py-2 text-sm font-semibold transition-all duration-150 ${
                                        txType === 'Deposit'
                                            ? 'bg-gradient-to-r from-green-950 to-green-900 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-green-900 hover:bg-green-50/50'
                                    }`}
                                >
                                    Deposit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTxType('Withdraw')}
                                    className={`rounded-lg py-2 text-sm font-semibold transition-all duration-150 ${
                                        txType === 'Withdraw'
                                            ? 'bg-gradient-to-r from-green-950 to-green-900 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-green-900 hover:bg-green-50/50'
                                    }`}
                                >
                                    Withdraw
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Amount (৳)
                            </label>
                            <div className="flex items-stretch gap-2">
                                <button
                                    type="button"
                                    onClick={() => adjustAmount(-TX_AMOUNT_STEP)}
                                    disabled={!txAmount || parseFloat(txAmount) <= 0}
                                    aria-label="Decrease by ৳500"
                                    className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-green-900/30 text-green-900 text-lg font-bold transition-all duration-200 hover:bg-green-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                                >
                                    −
                                </button>
                                <div className="relative flex-1">
                                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-gray-400">
                                        ৳
                                    </span>
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={txAmount}
                                        onChange={(e) => setTxAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2.5 text-sm outline-none transition focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-900/20 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => adjustAmount(TX_AMOUNT_STEP)}
                                    aria-label="Increase by ৳500"
                                    className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-green-900/30 text-green-900 text-lg font-bold transition-all duration-200 hover:bg-green-900 hover:text-white active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                            <p className="mt-1.5 text-xs text-gray-400">
                                Adjusts in steps of ৳{TX_AMOUNT_STEP.toLocaleString('en-BD')}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-gradient-to-r from-green-950 via-green-900 to-emerald-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-green-900 hover:via-green-850 hover:to-emerald-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
                        >
                            {submitting ? 'Processing...' : `Confirm ${txType}`}
                        </button>
                    </form>
                </div>

                {/* System Log Card (Dynamic Hover Glow) */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 lg:col-span-2 transition-all duration-200 !shadow-[0_4px_20px_rgba(6,78,59,0.07)] hover:!shadow-[0_12px_32px_rgba(16,185,129,0.18)] hover:!border-emerald-600/30">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        System Transaction Log
                    </h3>
                    <div className="max-h-[520px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-white">
                                <tr className="border-b border-gray-200 text-gray-400">
                                    <th className="pb-3 font-medium">User</th>
                                    <th className="pb-3 font-medium">Account No.</th>
                                    <th className="pb-3 font-medium">Type</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingData ? (
                                    <tr><td colSpan="5" className="py-6 text-center text-gray-400">Loading...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="5" className="py-6 text-center text-gray-400">No transactions recorded.</td></tr>
                                ) : (
                                    transactions.map((tx, i) => (
                                        <tr key={tx.id || i} className="text-gray-700 transition hover:bg-gray-50">
                                            <td className="py-3 font-medium">{tx.username || '—'}</td>
                                            <td className="py-3 font-mono text-xs">{tx.account_number || '—'}</td>
                                            <td className="py-3">
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                                                    tx.type === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className={`py-3 font-semibold ${tx.type === 'Deposit' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {tx.type === 'Deposit' ? '+' : '-'}৳{formatMoney(tx.amount)}
                                            </td>
                                            <td className="py-3 font-mono text-xs text-gray-400">{formatDate(tx.created_at)}</td>
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