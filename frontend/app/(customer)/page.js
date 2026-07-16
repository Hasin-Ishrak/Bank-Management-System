'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import accountService from '../../services/accountService';
import transactionService from '../../services/transactionService';
import reportService from '../../services/reportService';
import { extractData, extractList, formatMoney, formatDate } from '../../lib/normalize';

export default function CustomerDashboard() {
    const { user } = useAuth();

    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [accRes, txRes, loanRes] = await Promise.allSettled([
                    accountService.getMyAccount(),
                    transactionService.getMyTransactions(),
                    reportService.getMyLoans(),
                ]);

                if (accRes.status === 'fulfilled') {
                    setAccount(extractData(accRes.value));
                }
                if (txRes.status === 'fulfilled') {
                    setTransactions(extractList(txRes.value, ['transactions']));
                }
                if (loanRes.status === 'fulfilled') {
                    setLoans(extractList(loanRes.value, ['loans']));
                }

                if (accRes.status === 'rejected') {
                    setError('Could not load your account details right now.');
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const pendingLoans = loans.filter((l) => l.status === 'Pending').length;
    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            {/* Welcome banner */}
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
                <p className="text-sm font-medium text-emerald-200">
                    Welcome back,
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {user?.username || 'Customer'}
                </h1>
                <p className="mt-2 text-sm text-emerald-100">
                    Here&apos;s an overview of your account today.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Balance + quick actions */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border-l-4 border-emerald-600 bg-white p-6 shadow">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Available Balance
                        </h2>
                        {loading ? (
                            <div className="mt-3 h-9 w-40 animate-pulse rounded bg-gray-200" />
                        ) : (
                            <p className="mt-2 text-4xl font-extrabold text-green-900">
                                ${account ? formatMoney(account.balance) : '0.00'}
                            </p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                            <span>
                                Account No.{' '}
                                <span className="font-mono font-bold text-gray-900">
                                    {account?.account_number || 'No active account'}
                                </span>
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    account?.status === 'Active'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                                {account?.status || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { href: '/transaction?tab=deposit', label: 'Deposit', icon: '💰' },
                            { href: '/transaction?tab=withdraw', label: 'Withdraw', icon: '💵' },
                            { href: '/transaction?tab=transfer', label: 'Transfer', icon: '🔁' },
                            { href: '/loan', label: 'Apply Loan', icon: '📄' },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <span className="text-2xl">{action.icon}</span>
                                <span className="text-xs font-semibold text-gray-700">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Recent transactions */}
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                Recent Activity
                            </h3>
                            <Link
                                href="/transaction"
                                className="text-sm font-semibold text-green-800 hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-400">
                                        <th className="pb-3 font-medium">Type</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="py-6 text-center text-gray-400">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : recentTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-6 text-center text-gray-400">
                                                No recent transactions.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentTransactions.map((tx, i) => (
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

                {/* Side panel */}
                <div className="space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                            Loan Overview
                        </h3>
                        <p className="text-3xl font-extrabold text-green-900">
                            {loans.length}
                        </p>
                        <p className="text-xs text-gray-500">Total applications</p>
                        <p className="mt-3 text-sm text-gray-600">
                            {pendingLoans > 0
                                ? `${pendingLoans} pending review`
                                : 'No pending applications'}
                        </p>
                        <Link
                            href="/loan"
                            className="mt-4 inline-block text-sm font-semibold text-green-800 hover:underline"
                        >
                            Manage loans →
                        </Link>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                            Profile
                        </h3>
                        <p className="text-sm text-gray-600">
                            Keep your contact details and password up to date.
                        </p>
                        <Link
                            href="/profile"
                            className="mt-4 inline-block text-sm font-semibold text-green-800 hover:underline"
                        >
                            View profile →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
