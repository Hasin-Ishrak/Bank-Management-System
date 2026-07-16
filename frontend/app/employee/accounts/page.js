'use client';

import { useEffect, useState } from 'react';
import accountService from '../../../services/accountService';
import reportService from '../../../services/reportService';
import { extractList, extractData, formatMoney } from '../../../lib/normalize';

export default function EmployeeAccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newUserId, setNewUserId] = useState('');
    const [initialDeposit, setInitialDeposit] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await reportService.getSystemReports();
            const data = extractData(res) ?? res;
            setAccounts(extractList(data, ['accountSummaryReport', 'accounts']));
        } catch (error) {
            // non-fatal for this page; the form still works
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAccounts();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!newUserId.trim()) {
            setMessage({ type: 'error', text: 'Enter the customer\u2019s user ID.' });
            return;
        }

        setSubmitting(true);
        try {
            const res = await accountService.createAccount(
                newUserId.trim(),
                initialDeposit || 0
            );
            const data = extractData(res) ?? res;
            setMessage({
                type: 'success',
                text: `Account opened successfully${data?.account_number ? `: ${data.account_number}` : '.'}`,
            });
            setNewUserId('');
            setInitialDeposit('');
            loadAccounts();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to open new account.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold text-green-950">Customer Accounts</h1>
            <p className="mt-1 text-sm text-gray-500">
                Open new accounts and browse the account registry.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Open account form */}
                <div className="h-fit rounded-2xl bg-white p-6 shadow lg:col-span-1">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Open New Account
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

                    <form onSubmit={handleCreateAccount} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Customer User ID
                            </label>
                            <input
                                type="text"
                                required
                                value={newUserId}
                                onChange={(e) => setNewUserId(e.target.value)}
                                placeholder="e.g. 5"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Initial Deposit ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={initialDeposit}
                                onChange={(e) => setInitialDeposit(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-green-900 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-600"
                        >
                            {submitting ? 'Opening...' : 'Open Account'}
                        </button>
                    </form>
                </div>

                {/* Registry table */}
                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Account Registry
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-400">
                                    <th className="pb-3 font-medium">Client</th>
                                    <th className="pb-3 font-medium">Account No.</th>
                                    <th className="pb-3 font-medium">Balance</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-6 text-center text-gray-400">Loading...</td></tr>
                                ) : accounts.length === 0 ? (
                                    <tr><td colSpan="4" className="py-6 text-center text-gray-400">No accounts found.</td></tr>
                                ) : (
                                    accounts.map((acc, i) => (
                                        <tr key={acc.account_number || i} className="text-gray-700 hover:bg-gray-50">
                                            <td className="py-3 font-medium">{acc.username || '—'}</td>
                                            <td className="py-3 font-mono text-xs">{acc.account_number}</td>
                                            <td className="py-3 font-semibold text-gray-900">${formatMoney(acc.balance)}</td>
                                            <td className="py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                    acc.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                    {acc.status}
                                                </span>
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
