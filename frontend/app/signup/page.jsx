'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function SignupPage() {
    const { register } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');
        setSubmitting(true);

        const result = await register(
            username,
            phone,
            password
        );

        if (!result.success) {
            setError(result.message);
            setSubmitting(false);
            return;
        }

        setSuccess(result.message);

        setTimeout(() => {
            router.replace('/login');
        }, 1500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 px-4 py-10">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-900 text-3xl text-white shadow-lg">
                        🏦
                    </div>

                    <h1 className="text-3xl font-bold text-green-900">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Register for the Bank Management System
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Username
                        </label>

                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Choose a username"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Phone Number
                        </label>

                        <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                            placeholder="01XXXXXXXXX"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Create a strong password"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-green-900 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-600"
                    >
                        {submitting
                            ? 'Creating Account...'
                            : 'Create Account'}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="h-px flex-1 bg-gray-300"></div>
                    <span className="px-3 text-sm text-gray-500">
                        OR
                    </span>
                    <div className="h-px flex-1 bg-gray-300"></div>
                </div>

                <Link
                    href="/login"
                    className="block w-full rounded-lg border-2 border-green-900 py-3 text-center font-semibold text-green-900 transition hover:bg-green-900 hover:text-white"
                >
                    Back to Login
                </Link>

                <p className="mt-8 text-center text-xs text-gray-500">
                    Already have an account? Sign in to access your banking dashboard.
                </p>
            </div>
        </div>
    );
}