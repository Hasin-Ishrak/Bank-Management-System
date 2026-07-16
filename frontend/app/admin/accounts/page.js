'use client';

import { useEffect, useState } from 'react';
import accountService from '../../../services/accountService';
import reportService from '../../../services/reportService';
import { extractList, extractData, formatMoney } from '../../../lib/normalize';

export default function AdminAccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({ type: '', text: '' });

    // Lookup by user id
    const [lookupUserId, setLookupUserId] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await reportService.getSystemReports();
            const data = extractData(res) ?? res;
            setAccounts(extractList(data, ['accountSummaryReport', 'accounts']));
        } catch (error) {
            setNotification({ type: 'error', text: 'Failed to load account registry.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAccounts();
    }, []);

    const handleLookup = async (e) => {
        e.preventDefault();
        setLookupError('');
        setLookupResult(null);
        if (!lookupUserId.trim()) return;

        setLookupLoading(true);
        try {
            const res = await accountService.getUserAccount(lookupUserId.trim());
            setLookupResult(extractData(res));
        } catch (error) {
            setLookupError(error.response?.data?.message || 'No account found for that user ID.');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleDeactivate = async (accountNumber) => {
        if (!confirm(`Suspend account ${accountNumber}? This cannot be easily undone.`)) return;

        setNotification({ type: '', text: '' });
        setActionLoading(true);
        try {
            await accountService.deactivateAccount(accountNumber);
            setNotification({ type: 'success', text: `Account ${accountNumber} has been deactivated.` });
            loadAccounts();
        } catch (error) {
            setNotification({
                type: 'error',
                text: error.response?.data?.message || 'Failed to deactivate account.',
            });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold text-green-950">Account Registry</h1>
            <p className="mt-1 text-sm text-gray-500">
                View all customer accounts, look up by user ID, and manage account access.
            </p>

            {notification.text && (
                <div
                    className={`mt-6 rounded-lg border px-4 py-3 text-sm font-semibold ${
                        notification.type === 'success'
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : 'border-red-300 bg-red-50 text-red-600'
                    }`}
                >
                    {notification.text}
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Lookup panel */}
                <div className="h-fit rounded-2xl bg-white p-6 shadow lg:col-span-1">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Look Up Account</h3>
                    <form onSubmit={handleLookup} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                User ID
                            </label>
                            <input
                                type="text"
                                required
                                value={lookupUserId}
                                onChange={(e) => setLookupUserId(e.target.value)}
                                placeholder="e.g. 5"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={lookupLoading}
                            className="w-full rounded-lg bg-green-900 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
                        >
                            {lookupLoading ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    {lookupError && (
                        <p className="mt-3 text-xs font-semibold text-red-600">{lookupError}</p>
                    )}

                    {lookupResult && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
                            <div className="mb-2 flex justify-between">
                                <span className="text-gray-500">Account No.</span>
                                <span className="font-mono font-semibold text-gray-900">
                                    {lookupResult.account_number}
                                </span>
                            </div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-gray-500">Balance</span>
                                <span className="font-semibold text-green-900">
                                    ${formatMoney(lookupResult.balance)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                        lookupResult.status === 'Active'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {lookupResult.status}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Registry table */}
                <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        All Customer Accounts
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-400">
                                    <th className="pb-3 font-medium">Client</th>
                                    <th className="pb-3 font-medium">Account No.</th>
                                    <th className="pb-3 font-medium">Balance</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-6 text-center text-gray-400">Loading...</td></tr>
                                ) : accounts.length === 0 ? (
                                    <tr><td colSpan="5" className="py-6 text-center text-gray-400">No accounts found.</td></tr>
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
                                            <td className="py-3 text-right">
                                                {acc.status === 'Active' ? (
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={() => handleDeactivate(acc.account_number)}
                                                        className="rounded border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Suspend
                                                    </button>
                                                ) : (
                                                    <span className="text-xs italic font-semibold text-gray-400">Suspended</span>
                                                )}
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
