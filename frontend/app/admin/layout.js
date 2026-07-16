'use client';

import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ADMIN_LINKS = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/loans', label: 'Loans' },
    { href: '/admin/accounts', label: 'Accounts' },
    { href: '/admin/transactions', label: 'Transactions' },
    { href: '/admin/profile', label: 'Profile' },
];

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Navbar
                    role="Admin"
                    user={user}
                    links={ADMIN_LINKS}
                    onLogout={logout}
                />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
}
