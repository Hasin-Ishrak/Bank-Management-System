'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import accountService from '../../../services/accountService';
import authService from '../../../services/authService';
import { extractData, formatMoney } from '../../../lib/normalize';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

    const [account, setAccount] = useState(null);
    const [loadingAccount, setLoadingAccount] = useState(true);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadAccount = async () => {
            setLoadingAccount(true);
            try {
                const res = await accountService.getMyAccount();
                setAccount(extractData(res));
            } catch (error) {
                // Customer may not have an active account yet.
            } finally {
                setLoadingAccount(false);
            }
        };
        loadAccount();
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
            return;
        }

        setSubmitting(true);
        try {
            await authService.resetPassword(currentPassword, newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            refreshUser?.();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold text-green-950">Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
                View your personal and account details, and manage your password.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Personal + account details */}
                <div className="space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-900 text-xl font-bold text-white">
                                {(user?.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">
                                    {user?.username || '—'}
                                </p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                                    {user?.role || 'Customer'}
                                </p>
                            </div>
                        </div>

                        <dl className="divide-y divide-gray-100 text-sm">
                            <div className="flex justify-between py-2.5">
                                <dt className="text-gray-500">Phone Number</dt>
                                <dd className="font-mono font-semibold text-gray-900">
                                    {user?.phone || '—'}
                                </dd>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <dt className="text-gray-500">User ID</dt>
                                <dd className="font-mono font-semibold text-gray-900">
                                    {user?.id ?? '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                            Account Details
                        </h3>

                        {loadingAccount ? (
                            <div className="space-y-3">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                            </div>
                        ) : account ? (
                            <dl className="divide-y divide-gray-100 text-sm">
                                <div className="flex justify-between py-2.5">
                                    <dt className="text-gray-500">Account Number</dt>
                                    <dd className="font-mono font-semibold text-gray-900">
                                        {account.account_number}
                                    </dd>
                                </div>
                                <div className="flex justify-between py-2.5">
                                    <dt className="text-gray-500">Balance</dt>
                                    <dd className="font-semibold text-green-900">
                                        ${formatMoney(account.balance)}
                                    </dd>
                                </div>
                                <div className="flex justify-between py-2.5">
                                    <dt className="text-gray-500">Status</dt>
                                    <dd>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                account.status === 'Active'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {account.status}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="text-sm text-gray-400">
                                No active account found. Please visit a branch to open one.
                            </p>
                        )}
                    </div>
                </div>

                {/* Reset password */}
                <div className="h-fit rounded-2xl bg-white p-6 shadow">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Reset Password
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

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Current Password
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-green-900 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-600"
                        >
                            {submitting ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
