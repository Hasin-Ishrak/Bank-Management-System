'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import accountService from '../../../services/accountService';
import transactionService from '../../../services/transactionService';
import { extractData, extractList, formatMoney, formatDate } from '../../../lib/normalize';

const TABS = [
    { key: 'deposit', label: 'Deposit', icon: '💰' },
    { key: 'withdraw', label: 'Withdraw', icon: '💵' },
    { key: 'transfer', label: 'Transfer', icon: '🔁' },
];

function TransactionPageInner() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab');

    const [tab, setTab] = useState(
        TABS.some((t) => t.key === initialTab) ? initialTab : 'deposit'
    );

    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [amount, setAmount] = useState('');
    const [targetAccount, setTargetAccount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const loadData = async () => {
        setLoadingData(true);
        try {
            const [accRes, txRes] = await Promise.allSettled([
                accountService.getMyAccount(),
                transactionService.getMyTransactions(),
            ]);
            if (accRes.status === 'fulfilled') setAccount(extractData(accRes.value));
            if (txRes.status === 'fulfilled') {
                setTransactions(extractList(txRes.value, ['transactions']));
            }
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    const resetForm = () => {
        setAmount('');
        setTargetAccount('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!account?.account_number) {
            setMessage({ type: 'error', text: 'No active account found on your profile.' });
            return;
        }

        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            setMessage({ type: 'error', text: 'Enter a valid amount greater than 0.' });
            return;
        }

        setSubmitting(true);
        try {
            if (tab === 'deposit') {
                await transactionService.deposit(account.account_number, numericAmount);
                setMessage({ type: 'success', text: 'Deposit completed successfully!' });
            } else if (tab === 'withdraw') {
                if (numericAmount > parseFloat(account.balance || 0)) {
                    setMessage({ type: 'error', text: 'Withdrawal amount exceeds your available balance.' });
                    setSubmitting(false);
                    return;
                }
                await transactionService.withdraw(account.account_number, numericAmount);
                setMessage({ type: 'success', text: 'Withdrawal completed successfully!' });
            } else {
                if (!targetAccount.trim()) {
                    setMessage({ type: 'error', text: 'Enter a target account number.' });
                    setSubmitting(false);
                    return;
                }
                if (targetAccount.trim() === account.account_number) {
                    setMessage({ type: 'error', text: 'You cannot transfer to your own account.' });
                    setSubmitting(false);
                    return;
                }
                await transactionService.transfer(
                    account.account_number,
                    targetAccount.trim(),
                    numericAmount
                );
                setMessage({ type: 'success', text: 'Transfer completed successfully!' });
            }

            resetForm();
            loadData();
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
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold text-green-950">Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">
                Deposit, withdraw, or transfer funds from your account.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Form panel */}
                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-1">
                    <div className="mb-5 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Balance
                        </span>
                        <span className="font-mono text-sm font-bold text-green-900">
                            ${account ? formatMoney(account.balance) : '0.00'}
                        </span>
                    </div>

                    {/* Tabs */}
                    <div className="mb-5 grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => {
                                    setTab(t.key);
                                    setMessage({ type: '', text: '' });
                                    resetForm();
                                }}
                                className={`rounded-md py-2 text-xs font-semibold transition ${
                                    tab === t.key
                                        ? 'bg-green-900 text-white shadow'
                                        : 'text-gray-600 hover:bg-white'
                                }`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

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
                        {tab === 'transfer' && (
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Target Account Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={targetAccount}
                                    onChange={(e) => setTargetAccount(e.target.value)}
                                    placeholder="Recipient account number"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Amount ($)
                            </label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !account?.account_number}
                            className="w-full rounded-lg bg-green-900 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-600"
                        >
                            {submitting
                                ? 'Processing...'
                                : `Confirm ${TABS.find((t) => t.key === tab)?.label}`}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Transaction History
                    </h3>
                    <div className="max-h-[560px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b border-gray-200 text-gray-400">
                                    <th className="pb-3 font-medium">Type</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingData ? (
                                    <tr>
                                        <td colSpan="3" className="py-6 text-center text-gray-400">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-6 text-center text-gray-400">
                                            No transactions yet.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx, i) => (
                                        <tr key={tx.id || i} className="text-gray-700">
                                            <td className="py-3">
                                                <span
                                                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                                                        tx.type === 'Deposit'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td
                                                className={`py-3 font-semibold ${
                                                    tx.type === 'Deposit'
                                                        ? 'text-green-600'
                                                        : 'text-amber-600'
                                                }`}
                                            >
                                                {tx.type === 'Deposit' ? '+' : '-'}$
                                                {formatMoney(tx.amount)}
                                            </td>
                                            <td className="py-3 font-mono text-xs text-gray-400">
                                                {formatDate(tx.created_at)}
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

export default function TransactionPage() {
    return (
        <Suspense fallback={null}>
            <TransactionPageInner />
        </Suspense>
    );
}
