'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ROLE_LABELS = {
    Customer: 'Customer Portal',
    Employee: 'Staff Portal',
    Admin: 'Admin Portal',
};

export default function Navbar({ role, user, links = [], onLogout }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-green-950 via-green-900 to-emerald-900 shadow-lg">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="heartbeat-hover flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl shadow-[0_0_10px_1px_rgba(16,185,129,0.35)]">
                        🏦
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-bold tracking-wide text-white sm:text-base">
                            Bank Management System
                        </p>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">
                            {ROLE_LABELS[role] || 'Portal'}
                        </p>
                    </div>
                </div>

                {/* Desktop nav links (Account, Transaction, etc.) */}
                <nav className="hidden items-center gap-1 md:flex">
                    {links.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`hover-grow rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                    active
                                        ? 'bg-white/15 text-white shadow-[0_0_12px_1px_rgba(16,185,129,0.4)]'
                                        : 'text-emerald-100 hover:bg-white/10 hover:text-white hover:shadow-[0_0_10px_1px_rgba(16,185,129,0.35)]'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / logout */}
                <div className="hidden items-center gap-3 md:flex">
                    <span className="hover-grow rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50 hover:bg-white/20 hover:shadow-[0_0_10px_1px_rgba(16,185,129,0.35)]">
                        {user?.username || 'Loading...'}
                    </span>
                    <button
                        onClick={onLogout}
                        className="hover-grow rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.45)]"
                    >
                        Log Out
                    </button>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="hover-grow flex h-9 w-9 items-center justify-center rounded-lg text-white md:hidden"
                    aria-label="Toggle menu"
                >
                    <span className="text-xl">{open ? '✕' : '☰'}</span>
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="border-t border-white/10 bg-green-950 px-4 py-3 md:hidden">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="hover-grow rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50">
                            {user?.username || 'Loading...'}
                        </span>
                        <button
                            onClick={onLogout}
                            className="hover-grow rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                            Log Out
                        </button>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {links.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className={`hover-grow rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                        active
                                            ? 'bg-white/15 text-white'
                                            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}