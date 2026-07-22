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

    // Dynamic Floating Notification Alert Node
    const [toast, setToast] = useState({ show: false, type: '', text: '' });

    const popNotification = (type, text) => {
        setToast({ show: true, type, text });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 4000);
    };

    useEffect(() => {
        const loadAccount = async () => {
            setLoadingAccount(true);
            try {
                const res = await accountService.getMyAccount();
                setAccount(extractData(res));
            } catch (error) {
                // Identity node fallback for empty accounts handled gracefully
            } finally {
                setLoadingAccount(false);
            }
        };
        loadAccount();
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            popNotification('error', 'Password sequence failed: New key parameters must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            popNotification('error', 'Password sequence failed: Parameter mismatch between new input and verification.');
            return;
        }

        setSubmitting(true);
        try {
            await authService.resetPassword(currentPassword, newPassword);
            popNotification('success', 'Security authentication keys updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            refreshUser?.();
        } catch (error) {
            const serverMessage = error.response?.data?.message || 'Server connection layout failure.';
            popNotification('error', `Password sequence failed: ${serverMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 relative">
            
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
                            Security Node Alert
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
                <h1 className="text-2xl font-extrabold tracking-tight text-green-950 sm:text-3xl">Profile Settings</h1>
                <p className="mt-1.5 text-sm font-medium text-gray-500">
                    View your personal context details, system node metrics, and cryptographic access parameters.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Personal + Account Details Column */}
                <div className="space-y-6">
                    {/* User Profile Identifier Info Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 !shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-900 text-xl font-bold text-white shadow-inner">
                                {(user?.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900 tracking-tight">
                                    {user?.username || '—'}
                                </p>
                                <p className="text-[10px] inline-block rounded border border-emerald-200/40 bg-emerald-50 px-2 py-0.5 font-bold uppercase tracking-wider text-emerald-700">
                                    {user?.role || 'Customer'}
                                </p>
                            </div>
                        </div>

                        <dl className="divide-y divide-gray-50 text-xs font-medium">
                            <div className="flex justify-between py-3">
                                <dt className="text-gray-400">Phone Identity Link</dt>
                                <dd className="font-mono font-bold text-gray-900">
                                    {user?.phone || '—'}
                                </dd>
                            </div>
                            <div className="flex justify-between py-3">
                                <dt className="text-gray-400">Unique Identity ID</dt>
                                <dd className="font-mono font-bold text-gray-400">
                                    {user?.id ?? '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Financial Asset Core Account Details Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 !shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                            Asset Node Details
                        </h3>

                        {loadingAccount ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="flex justify-between py-1"><div className="h-4 w-28 rounded bg-gray-100" /> <div className="h-4 w-32 rounded bg-gray-100" /></div>
                                <div className="flex justify-between py-1"><div className="h-4 w-16 rounded bg-gray-100" /> <div className="h-4 w-24 rounded bg-gray-100" /></div>
                                <div className="flex justify-between py-1"><div className="h-4 w-14 rounded bg-gray-100" /> <div className="h-5 w-16 rounded-full bg-gray-100" /></div>
                            </div>
                        ) : account ? (
                            <dl className="divide-y divide-gray-50 text-xs font-medium">
                                <div className="flex justify-between py-3 items-center">
                                    <dt className="text-gray-400">Account Registry Number</dt>
                                    <dd className="font-mono font-bold text-gray-900 text-sm">
                                        {account.account_number}
                                    </dd>
                                </div>
                                <div className="flex justify-between py-3 items-center">
                                    <dt className="text-gray-400">Available Liquid Ledger Balance</dt>
                                    <dd className="font-bold text-green-950 text-base flex items-center gap-0.5">
                                        <span className="text-gray-400 text-xs font-bold">৳</span>
                                        {formatMoney(account.balance)}
                                    </dd>
                                </div>
                                <div className="flex justify-between py-3 items-center">
                                    <dt className="text-gray-400">System State Node</dt>
                                    <dd>
                                        <span
                                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                                account.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40'
                                                    : 'bg-gray-100 text-gray-500 border-gray-200/40'
                                            }`}
                                        >
                                            {account.status}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="text-xs text-gray-400 font-medium py-2">
                                No active account matrix found on this identity token. Please visit an operational branch node to initialize database registration.
                            </p>
                        )}
                    </div>
                </div>

                {/* Reset Password Security Panel Column */}
                <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 !shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-emerald-500/20">
                    <h3 className="mb-4 text-md font-bold text-gray-900 tracking-tight">
                        Reset Access Password
                    </h3>

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                Current Account Key
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-900 transition focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                New Security Passphrase
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-900 transition focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                Confirm New Passphrase
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-900 transition focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 rounded-xl bg-green-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                        >
                            {submitting ? 'Updating security matrix...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}