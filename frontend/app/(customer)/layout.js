'use client';

import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CUSTOMER_LINKS = [
    { href: '/', label: 'Dashboard' },
    { href: '/transaction', label: 'Transactions' },
    { href: '/loan', label: 'Loans' },
    { href: '/profile', label: 'Profile' },
];

export default function CustomerLayout({ children }) {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute allowedRoles={['Customer']}>
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Navbar
                    role="Customer"
                    user={user}
                    links={CUSTOMER_LINKS}
                    onLogout={logout}
                />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
}
