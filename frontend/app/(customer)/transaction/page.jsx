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

    // Toast Popup System State
    const [toast, setToast] = useState({ show: false, type: '', text: '' });

    // Function to trigger the floating notification
    const popNotification = (type, text) => {
        setToast({ show: true, type, text });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 4000);
    };

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
        loadData();
    }, []);

    const resetForm = () => {
        setAmount('');
        setTargetAccount('');
    };

    // Helper to get formatted dynamic name for notifications
    const getOperationName = (currentTab) => {
        if (currentTab === 'deposit') return 'Deposit';
        if (currentTab === 'withdraw') return 'Withdrawal';
        return 'Transfer';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const operationName = getOperationName(tab);

        if (!account?.account_number) {
            popNotification('error', `${operationName} failed: No active account profile found.`);
            return;
        }

        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            popNotification('error', `${operationName} failed: Invalid amount entered.`);
            return;
        }

        setSubmitting(true);
        try {
            if (tab === 'deposit') {
                await transactionService.deposit(account.account_number, numericAmount);
                popNotification('success', 'Deposit successful!');
            } else if (tab === 'withdraw') {
                if (numericAmount > parseFloat(account.balance || 0)) {
                    popNotification('error', 'Withdrawal failed: Insufficient ledger balance.');
                    setSubmitting(false);
                    return;
                }
                await transactionService.withdraw(account.account_number, numericAmount);
                popNotification('success', 'Withdrawal successful!');
            } else {
                if (!targetAccount.trim()) {
                    popNotification('error', 'Transfer failed: Target account sequence required.');
                    setSubmitting(false);
                    return;
                }
                if (targetAccount.trim() === account.account_number) {
                    popNotification('error', 'Transfer failed: Cannot route funds to yourself.');
                    setSubmitting(false);
                    return;
                }
                await transactionService.transfer(
                    account.account_number,
                    targetAccount.trim(),
                    numericAmount
                );
                popNotification('success', 'Transfer successful!');
            }

            resetForm();
            loadData();
        } catch (error) {
            const serverMessage = error.response?.data?.message || 'Server connection issue.';
            popNotification('error', `${operationName} failed: ${serverMessage}`);
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
                <h1 className="text-2xl font-extrabold tracking-tight text-green-950 sm:text-3xl">Ledger Transactions</h1>
                <p className="mt-1.5 text-sm font-medium text-gray-500">
                    Securely execute asset adjustments, withdrawals, or configure external balance transfers.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Form configuration panel */}
                <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 !shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-emerald-500/20 lg:col-span-1">
                    <div className="mb-5 flex items-center justify-between rounded-xl bg-gray-50/70 border border-gray-100/50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Available Balance
                        </span>
                        {loadingData ? (
                            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                        ) : (
                            <span className="font-mono text-sm font-black text-green-950 flex items-center gap-0.5">
                                <span className="text-emerald-700 font-bold">৳</span>
                                {account ? formatMoney(account.balance) : '0.00'}
                            </span>
                        )}
                    </div>

                    {/* Operational tab toggles */}
                    <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => {
                                    setTab(t.key);
                                    resetForm();
                                }}
                                className={`rounded-lg py-2.5 text-xs font-bold transition-all duration-200 ${
                                    tab === t.key
                                        ? 'bg-green-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                                }`}
                            >
                                <span className="mr-1">{t.icon}</span> {t.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {tab === 'transfer' && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Target Account Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={targetAccount}
                                    onChange={(e) => setTargetAccount(e.target.value)}
                                    placeholder="Recipient digital asset key"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-xs transition placeholder:text-gray-300 focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                Amount (৳)
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="text-xs font-bold text-gray-400">৳</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-8 pr-4 text-xs font-semibold text-gray-900 transition placeholder:text-gray-300 focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !account?.account_number}
                            className="w-full mt-2 rounded-xl bg-green-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                        >
                            {submitting
                                ? 'Processing node sync...'
                                : `Confirm Asset ${TABS.find((t) => t.key === tab)?.label}`}
                        </button>
                    </form>
                </div>

                {/* Audit statement history block */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 text-md font-bold text-gray-900 tracking-tight">
                        Node Transaction History
                    </h3>
                    <div className="max-h-[560px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <th className="pb-3 font-semibold">Classification Type</th>
                                    <th className="pb-3 font-semibold text-right">Settled Amount</th>
                                    <th className="pb-3 font-semibold text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {loadingData ? (
                                    [...Array(5)].map((_, idx) => (
                                        <tr key={idx} className="animate-pulse">
                                            <td className="py-4"><div className="h-4 w-16 rounded bg-gray-100" /></td>
                                            <td className="py-4 text-right"><div className="h-4 w-20 rounded bg-gray-100 ml-auto" /></td>
                                            <td className="py-4 text-right"><div className="h-4 w-24 rounded bg-gray-100 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-12 text-center text-gray-400 font-medium">
                                            No systemic logs mapped to this micro-ledger node yet.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx, i) => (
                                        <tr key={tx.id || i} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5">
                                                <span
                                                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                                        tx.type === 'Deposit'
                                                            ? 'bg-green-50 text-green-700 border-green-200/40'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200/40'
                                                    }`}
                                                >
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td
                                                className={`py-3.5 text-right font-bold text-sm ${
                                                    tx.type === 'Deposit' ? 'text-green-600' : 'text-amber-600'
                                                }`}
                                            >
                                                {tx.type === 'Deposit' ? '+' : '-'} ৳{formatMoney(tx.amount)}
                                            </td>
                                            <td className="py-3.5 text-right font-mono text-gray-400">
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