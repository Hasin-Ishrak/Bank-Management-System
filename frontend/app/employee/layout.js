'use client';

import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const EMPLOYEE_LINKS = [
    { href: '/employee', label: 'Dashboard' },
    { href: '/employee/accounts', label: 'Accounts' },
    { href: '/employee/transactions', label: 'Transactions' },
    { href: '/employee/profile', label: 'Profile' },
];

export default function EmployeeLayout({ children }) {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute allowedRoles={['Employee']}>
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Navbar
                    role="Employee"
                    user={user}
                    links={EMPLOYEE_LINKS}
                    onLogout={logout}
                />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
}
