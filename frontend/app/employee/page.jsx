'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import reportService from '../../services/reportService';
import { extractList, extractData, formatMoney } from '../../lib/normalize';

export default function EmployeeDashboard() {
    const { user } = useAuth();

    const [accounts, setAccounts] = useState([]);
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
            } catch (err) {
                setError('Could not load account overview right now.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const activeAccounts = accounts.filter((a) => a.status === 'Active').length;
    const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    const stats = [
        { label: 'Total Accounts', value: accounts.length },
        { label: 'Active Accounts', value: activeAccounts },
        { label: 'Total Deposits Held', value: `$${formatMoney(totalBalance)}` },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
                <p className="text-sm font-medium text-emerald-200">Staff Terminal</p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {user?.username || 'Employee'}
                </h1>
                <p className="mt-2 text-sm text-emerald-100">
                    Open accounts and process over-the-counter transactions.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white p-5 shadow">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {s.label}
                        </p>
                        <p className="mt-2 text-2xl font-extrabold text-green-900">
                            {loading ? '—' : s.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                    href="/employee/accounts"
                    className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <span className="text-3xl">🗂️</span>
                    <div>
                        <p className="font-bold text-gray-900">Open a New Account</p>
                        <p className="text-sm text-gray-500">
                            Create an account and view the customer registry.
                        </p>
                    </div>
                </Link>

                <Link
                    href="/employee/transactions"
                    className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <span className="text-3xl">🧾</span>
                    <div>
                        <p className="font-bold text-gray-900">Process a Transaction</p>
                        <p className="text-sm text-gray-500">
                            Handle counter deposits and withdrawals.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
