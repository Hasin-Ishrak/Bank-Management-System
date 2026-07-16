'use client';

import { useEffect, useState } from 'react';
import transactionService from '../../../services/transactionService';
import { extractList, extractData, formatMoney, formatDate } from '../../../lib/normalize';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await transactionService.getAllTransactions();
                setTransactions(extractList(extractData(res) ?? res, ['transactions']));
            } catch (err) {
                setError('Failed to load system transactions.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = transactions
        .filter((tx) => (filter === 'All' ? true : tx.type === filter))
        .filter((tx) =>
            search.trim()
                ? `${tx.username || ''} ${tx.account_number || ''}`
                      .toLowerCase()
                      .includes(search.trim().toLowerCase())
                : true
        );

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-green-950">All Transactions</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Full system-wide transaction feed across all accounts.
                    </p>
                </div>
                <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                    {['All', 'Deposit', 'Withdrawal', 'Transfer'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                filter === f ? 'bg-green-900 text-white shadow' : 'text-gray-600 hover:bg-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="rounded-2xl bg-white p-6 shadow">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by username or account number..."
                    className="mb-4 w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-400">
                                <th className="pb-3 font-medium">User</th>
                                <th className="pb-3 font-medium">Account No.</th>
                                <th className="pb-3 font-medium">Type</th>
                                <th className="pb-3 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="py-6 text-center text-gray-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="py-6 text-center text-gray-400">No transactions found.</td></tr>
                            ) : (
                                filtered.map((tx, i) => (
                                    <tr key={tx.id || i} className="text-gray-700 hover:bg-gray-50">
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
    );
}
