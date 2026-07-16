'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function SignupPage() {
    const { register } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');
        setSubmitting(true);

        const result = await register(username, password);

        if (!result.success) {
            setError(result.message);
            setSubmitting(false);
            return;
        }

        setSuccess(result.message);

        setTimeout(() => {
            router.push('/login');
        }, 1500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Secure Core Signup
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Create your Centralized Bank Management System account
                    </p>
                </div>

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                        {success}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                                Username
                            </label>

                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Choose a username"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Create a password"
                            />
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="flex w-full justify-center rounded-md border border-blue-600 bg-white py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                        Back to Login
                    </Link>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {submitting
                            ? 'Creating account...'
                            : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}