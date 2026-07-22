'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function SignupPage() {
    const { register } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Popup toast notification state framework
    const [toast, setToast] = useState({ show: false, type: '', text: '' });

    // Handles automatic timeout auto-dismiss sequence for active alerts
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const triggerToast = (type, text) => {
        setToast({ show: true, type, text });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const result = await register(username, phone, password);

        if (!result.success) {
            triggerToast('error', result.message || 'Registration failed. Please check your data fields.');
            setSubmitting(false);
            return;
        }

        triggerToast('success', result.message || 'Profile created successfully! Routing to access node...');

        setTimeout(() => {
            router.replace('/login');
        }, 1500);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 px-4 py-10">
            
            {/* Floating Right-Side Popup Notification Layout */}
            {toast.show && (
                <div 
                    className={`fixed top-6 right-6 z-50 flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 transition-all duration-300 transform translate-x-0 ${
                        toast.type === 'success'
                            ? 'border-green-100 !shadow-[0_10px_30px_rgba(6,78,59,0.12)]'
                            : 'border-red-100 !shadow-[0_10px_30px_rgba(220,38,38,0.12)]'
                    }`}
                >
                    {/* Dynamic Status Icon Indicator */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        toast.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                        {toast.type === 'success' ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>

                    {/* Notification Main Meta Values */}
                    <div className="flex-1 pt-0.5">
                        <p className="text-sm font-bold text-gray-900">
                            {toast.type === 'success' ? 'Registration Complete' : 'Registration Alert'}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-gray-500 leading-relaxed">
                            {toast.text}
                        </p>
                    </div>

                    {/* Manual Dismiss Button Crosshead */}
                    <button
                        onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                        className="text-gray-400 hover:text-gray-600 transition p-0.5 rounded-lg hover:bg-gray-50"
                        aria-label="Dismiss notification"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Main Signup Form Container Card */}
            <div className="w-full max-w-md rounded-2xl border border-transparent bg-white p-8 transition-all duration-300 !shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:!shadow-[0_20px_50px_rgba(16,185,129,0.22)] hover:!border-emerald-500/20">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-950 to-green-800 text-3xl text-white shadow-lg transition-transform duration-300 hover:rotate-6">
                        🏦
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-green-950">
                        Create Account
                    </h1>

                    <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Register Employee Node Profile
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose an identification tag"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-900/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-900/20 text-left tracking-wide"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Password
                        </label>
                        <div className="relative flex items-stretch">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong account key"
                                className="w-full rounded-lg border border-gray-300 pl-4 pr-10 py-2.5 text-sm outline-none transition focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-900/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-900 transition"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 w-full rounded-lg bg-gradient-to-r from-green-950 via-green-900 to-emerald-900 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-green-900 hover:via-green-850 hover:to-emerald-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
                    >
                        {submitting ? 'Creating Profile...' : 'Create Account'}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        System Boundary
                    </span>
                    <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <Link
                    href="/login"
                    className="block w-full rounded-lg border border-green-900/30 py-2.5 text-center text-sm font-bold text-green-950 transition-all duration-200 hover:bg-green-50/60 active:scale-[0.99]"
                >
                    Back to Login
                </Link>

                <p className="mt-6 text-center text-xs font-medium text-gray-400 leading-relaxed">
                    Already registered? Clear validation and sign in to access your administrative workspace panel.
                </p>
            </div>
        </div>
    );
}