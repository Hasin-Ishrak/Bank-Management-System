'use client';

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import authService from '../../../services/authService';

export default function EmployeeProfilePage() {
    const { user, refreshUser } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold text-green-950">Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
                Your staff account details and security settings.
            </p>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-900 text-xl font-bold text-white">
                        {(user?.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{user?.username || '—'}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                            {user?.role || 'Employee'}
                        </p>
                    </div>
                </div>

                <dl className="mb-6 divide-y divide-gray-100 text-sm">
                    <div className="flex justify-between py-2.5">
                        <dt className="text-gray-500">Phone Number</dt>
                        <dd className="font-mono font-semibold text-gray-900">{user?.phone || '—'}</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                        <dt className="text-gray-500">User ID</dt>
                        <dd className="font-mono font-semibold text-gray-900">{user?.id ?? '—'}</dd>
                    </div>
                </dl>

                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
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
                        className="w-full rounded-lg bg-green-900 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-600 sm:w-auto sm:px-8"
                    >
                        {submitting ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
