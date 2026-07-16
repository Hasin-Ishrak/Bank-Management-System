'use client';

import { useEffect, useState } from 'react';
import transactionService from '../../../services/transactionService';
import { extractList, extractData, formatMoney, formatDate } from '../../../lib/normalize';

export default function EmployeeTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [targetAccount, setTargetAccount] = useState('');
    const [txType, setTxType] = useState('Deposit');
    const [txAmount, setTxAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTransactions();
    }, []);

    const handleCounterTransaction = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const numericAmount = parseFloat(txAmount);
        if (!targetAccount.trim()) {
            setMessage({ type: 'error', text: 'Enter the customer account number.' });
            return;
        }
        if (!numericAmount || numericAmount <= 0) {
            setMessage({ type: 'error', text: 'Enter a valid amount greater than 0.' });
            return;
        }

        setSubmitting(true);
        try {
            if (txType === 'Deposit') {
                await transactionService.deposit(targetAccount.trim(), numericAmount);
            } else {
                await transactionService.withdraw(targetAccount.trim(), numericAmount);
            }
            setMessage({ type: 'success', text: `Counter ${txType.toLowerCase()} processed successfully.` });
            setTargetAccount('');
            setTxAmount('');
            loadTransactions();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Transaction failed. Please try again.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold text-green-950">Counter Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">
                Process customer deposits and withdrawals over the counter.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="h-fit rounded-2xl bg-white p-6 shadow lg:col-span-1">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Process Transaction
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Operation
                            </label>
                            <select
                                value={txType}
                                onChange={(e) => setTxType(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            >
                                <option value="Deposit">Deposit</option>
                                <option value="Withdraw">Withdraw</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Amount ($)
                            </label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={txAmount}
                                onChange={(e) => setTxAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-green-900 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-600"
                        >
                            {submitting ? 'Processing...' : `Confirm ${txType}`}
                        </button>
                    </form>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        System Transaction Log
                    </h3>
                    <div className="max-h-[520px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-white">
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
                                        <tr key={tx.id || i} className="text-gray-700">
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
                                                {tx.type === 'Deposit' ? '+' : '-'}${formatMoney(tx.amount)}
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
