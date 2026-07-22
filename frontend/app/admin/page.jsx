'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import reportService from '../../services/reportService';
import { extractList, extractData, formatMoney, formatDate } from '../../lib/normalize';

export default function AdminDashboard() {
    const { user } = useAuth();

    const [accounts, setAccounts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await reportService.getSystemReports();
                const data = extractData(res) ?? res;
                setAccounts(extractList(data, ['accountSummaryReport', 'accounts']));
                setLoans(extractList(data, ['loanReport', 'loans']));
                setTransactions(extractList(data, ['transactionReport', 'transactions']));
            } catch (err) {
                setError('Could not load system reports right now.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
    const pendingLoans = loans.filter((l) => l.status === 'Pending').length;
    const recentTransactions = transactions.slice(0, 6);

    const stats = [
        { label: 'Total Accounts', value: accounts.length, href: '/admin/accounts' },
        { label: 'Total Balance', value: `$${formatMoney(totalBalance)}`, href: '/admin/accounts' },
        { label: 'Pending Loans', value: pendingLoans, href: '/admin/loans' },
        { label: 'Total Transactions', value: transactions.length, href: '/admin/transactions' },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
                <p className="text-sm font-medium text-emerald-200">Administrator</p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {user?.username || 'Admin'}
                </h1>
                <p className="mt-2 text-sm text-emerald-100">
                    System-wide overview of accounts, loans, and transactions.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s) => (
                    <Link
                        key={s.label}
                        href={s.href}
                        className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {s.label}
                        </p>
                        <p className="mt-2 text-2xl font-extrabold text-green-900">
                            {loading ? '—' : s.value}
                        </p>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                            Loan Applications
                        </h3>
                        <Link href="/admin/loans" className="text-sm font-semibold text-green-800 hover:underline">
                            Manage →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-400">
                                    <th className="pb-3 font-medium">Applicant</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="3" className="py-6 text-center text-gray-400">Loading...</td></tr>
                                ) : loans.length === 0 ? (
                                    <tr><td colSpan="3" className="py-6 text-center text-gray-400">No loan applications.</td></tr>
                                ) : (
                                    loans.slice(0, 6).map((loan, i) => (
                                        <tr key={loan.id || i} className="text-gray-700">
                                            <td className="py-3 font-medium">{loan.username || '—'}</td>
                                            <td className="py-3 font-semibold text-gray-900">${formatMoney(loan.amount)}</td>
                                            <td className="py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                    loan.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    loan.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {loan.status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Live Transaction Feed
                    </h3>
                    <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                        {loading ? (
                            <p className="py-6 text-center text-sm text-gray-400">Loading...</p>
                        ) : recentTransactions.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-400">No transactions yet.</p>
                        ) : (
                            recentTransactions.map((tx, i) => (
                                <div key={tx.id || i} className="border-b border-gray-100 pb-3 text-xs last:border-0">
                                    <div className="mb-1 flex justify-between font-medium text-gray-800">
                                        <span>{tx.username || tx.account_number}</span>
                                        <span className={tx.type === 'Deposit' ? 'font-bold text-green-600' : 'font-bold text-amber-600'}>
                                            {tx.type === 'Deposit' ? '+' : '-'}${formatMoney(tx.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-mono text-gray-400">
                                        <span>{tx.type}</span>
                                        <span>{formatDate(tx.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
