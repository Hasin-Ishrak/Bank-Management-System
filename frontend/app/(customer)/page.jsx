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
                    setError('Unable to securely sync account configuration data at this time.');
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Welcome banner (With subtle internal light layer accenting) */}
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 p-6 text-white !shadow-[0_10px_30px_rgba(6,78,59,0.2)] sm:p-8 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                    Secure Dashboard Node
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Welcome back, {user?.username || 'Valued Customer'}
                </h1>
                <p className="mt-2 text-sm text-emerald-100/80 max-w-xl">
                    Here is an overview of your active financial ledgers, registry portfolios, and transactions today.
                </p>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3.5 text-sm font-semibold text-red-700">
                    <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Balance + quick actions segment core */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 !shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:!shadow-[0_12px_30px_rgba(16,185,129,0.12)] hover:border-emerald-500/20">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Available Ledger Balance
                        </h2>
                        {loading ? (
                            <div className="mt-3 h-10 w-48 animate-pulse rounded-lg bg-gray-100" />
                        ) : (
                            <p className="mt-2 text-4xl font-black tracking-tight text-green-950 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-emerald-700">৳</span>
                                {account ? formatMoney(account.balance) : '0.00'}
                            </p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-4 text-xs font-medium text-gray-500">
                            <span>
                                Account Serial Number:{' '}
                                <span className="font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                    {account?.account_number || 'No deployment key assigned'}
                                </span>
                            </span>
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                                    account?.status === 'Active'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                        : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                {account?.status || 'Null Entry'}
                            </span>
                        </div>
                    </div>

                    {/* Quick navigation modules */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { href: '/transaction?tab=deposit', label: 'Deposit Money', icon: '💰' },
                            { href: '/transaction?tab=withdraw', label: 'Withdrawal', icon: '💵' },
                            { href: '/transaction?tab=transfer', label: 'Fund Transfer', icon: '🔁' },
                            { href: '/loan', label: 'Apply Loan', icon: '📄' },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="group flex flex-col items-center gap-2.5 rounded-xl border border-transparent bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:!shadow-[0_10px_25px_rgba(6,78,59,0.08)] hover:border-green-900/10 active:translate-y-0"
                            >
                                <span className="text-2xl transition-transform duration-200 group-hover:scale-110">{action.icon}</span>
                                <span className="text-xs font-bold text-gray-700 group-hover:text-green-950 transition-colors">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Recent ledger transactions datagrid */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-md font-bold text-gray-900 tracking-tight">
                                Recent Ledger Activity
                            </h3>
                            <Link
                                href="/transaction"
                                className="text-xs font-bold text-green-900 hover:text-emerald-700 transition flex items-center gap-0.5"
                            >
                                View full statements <span>→</span>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <th className="pb-3 font-semibold">Transaction Type</th>
                                        <th className="pb-3 font-semibold text-right">Settled Amount</th>
                                        <th className="pb-3 font-semibold text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs font-medium">
                                    {loading ? (
                                        [...Array(3)].map((_, idx) => (
                                            <tr key={idx} className="animate-pulse">
                                                <td className="py-3.5"><div className="h-4 w-20 rounded bg-gray-100" /></td>
                                                <td className="py-3.5 text-right"><div className="h-4 w-24 rounded bg-gray-100 ml-auto" /></td>
                                                <td className="py-3.5 text-right"><div className="h-4 w-28 rounded bg-gray-100 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : recentTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-8 text-center text-gray-400 font-medium">
                                                No processed activity found on this system node.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentTransactions.map((tx, i) => (
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

                {/* Auxiliary Context Management Sidebars */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:!shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                            Corporate Loan Overview
                        </h3>
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-8 w-12 animate-pulse rounded bg-gray-100" />
                                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                            </div>
                        ) : (
                            <>
                                <p className="text-3xl font-black text-green-950">
                                    {loans.length}
                                </p>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Total applications submitted</p>
                                <div className="mt-3 text-xs font-semibold">
                                    {pendingLoans > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-amber-700 border border-amber-200/50">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                            {pendingLoans} pending administrative verification
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 font-medium">Clear stack - No active processing backlogs</span>
                                    )}
                                </div>
                            </>
                        )}
                        <Link
                            href="/loan"
                            className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-green-900 hover:text-emerald-700 transition"
                        >
                            Manage credit streams <span>→</span>
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:!shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                            Identity Profile Context
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Review structural permission clearance levels, verification logs, and active routing keys.
                        </p>
                        <Link
                            href="/profile"
                            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-green-900 hover:text-emerald-700 transition"
                        >
                            View node settings <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}