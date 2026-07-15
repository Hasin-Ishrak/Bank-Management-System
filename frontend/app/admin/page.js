'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminDashboard() {
    const { logout } = useAuth();
    
    // Core Report State Datasets
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loans, setLoans] = useState([]);

    // Operation UI State
    const [notification, setNotification] = useState({ type: '', text: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const loadReportingData = async () => {
        try {
            const res = await api.get('/report/dashboard/metrics');
            setTransactions(res.data.transactionReport || []);
            setAccounts(res.data.accountSummaryReport || []);
            setLoans(res.data.loanReport || []);
        } catch (error) {
            console.error('Failed to wake up metrics reporting engine:', error);
        }
    };

    useEffect(() => {
        loadReportingData();
    }, []);

    // 1. Authorize Loan (Approve/Reject)
    const handleUpdateLoan = async (loanId, newStatus) => {
        setNotification({ type: '', text: '' });
        setActionLoading(true);
        try {
            await api.put(`/report/loans/${loanId}/status`, { status: newStatus });
            setNotification({ type: 'success', text: `Loan application successfully ${newStatus}!` });
            loadReportingData(); // Refresh datasets
        } catch (error) {
            setNotification({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update target loan status.' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    // 2. Administrative Account Deactivation Override
    const handleDeactivateAccount = async (accountNumber) => {
        if (!confirm(`Are you absolutely sure you want to suspend account ${accountNumber}?`)) return;
        
        setNotification({ type: '', text: '' });
        setActionLoading(true);
        try {
            await api.put(`/account/deactivate/${accountNumber}`);
            setNotification({ type: 'success', text: `Account ${accountNumber} has been locked and deactivated.` });
            loadReportingData();
        } catch (error) {
            setNotification({ 
                type: 'error', 
                text: error.response?.data?.message || 'Deactivation operation failed.' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <div className="min-h-screen bg-gray-100">
                {/* Global Dashboard Navigation Header */}
                <nav className="bg-indigo-900 p-4 text-white shadow flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-tight">Executive Management Terminal</h1>
                    <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded transition font-medium">
                        Close Admin Session
                    </button>
                </nav>

                <main className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Status Feedback banner notifications */}
                    {notification.text && (
                        <div className={`p-3 rounded font-semibold text-sm border ${
                            notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {notification.text}
                        </div>
                    )}

                    {/* Section 1: Loan Application Approvals Board */}
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Loan Review Matrix</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-400">
                                        <th className="pb-3">Applicant User</th>
                                        <th className="pb-3">Capital Requested</th>
                                        <th className="pb-3">Decision Status</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {loans.length === 0 ? (
                                        <tr><td colSpan="4" className="py-4 text-center text-gray-400">No loans logged.</td></tr>
                                    ) : (
                                        loans.map((loan) => (
                                            <tr key={loan.id} className="hover:bg-gray-50">
                                                <td className="py-3 font-medium">{loan.username}</td>
                                                <td className="py-3 font-semibold text-gray-900">${parseFloat(loan.amount).toFixed(2)}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        loan.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        loan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>{loan.status}</span>
                                                </td>
                                                <td className="py-3 text-right space-x-2">
                                                    {loan.status === 'Pending' && (
                                                        <>
                                                            <button disabled={actionLoading} onClick={() => handleUpdateLoan(loan.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1 rounded transition">Approve</button>
                                                            <button disabled={actionLoading} onClick={() => handleUpdateLoan(loan.id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1 rounded transition">Reject</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 2: Global Customer Directory and Administrative Disables */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Global Account Registry Override</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-400">
                                            <th className="pb-3">Client</th>
                                            <th className="pb-3">Account No.</th>
                                            <th className="pb-3">Balance</th>
                                            <th className="pb-3 text-right">Access Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {accounts.map((acc, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="py-3 font-medium">{acc.username}</td>
                                                <td className="py-3 font-mono text-xs">{acc.account_number}</td>
                                                <td className="py-3 font-semibold text-gray-900">${parseFloat(acc.balance).toFixed(2)}</td>
                                                <td className="py-3 text-right">
                                                    {acc.status === 'Active' ? (
                                                        <button disabled={actionLoading} onClick={() => handleDeactivateAccount(acc.account_number)} className="text-red-600 hover:text-red-800 text-xs font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition">
                                                            Suspend Account
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic font-semibold">Suspended</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: Live Real-time System Audit Feed Logs */}
                        <div className="bg-white p-6 rounded-xl shadow lg:col-span-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Live System Transaction Feed</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {transactions.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">No operations executed yet.</p>
                                ) : (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="text-xs border-b border-gray-100 pb-3 last:border-0">
                                            <div className="flex justify-between font-medium text-gray-800 mb-1">
                                                <span>User: <strong className="text-gray-900">{tx.username}</strong> ({tx.account_number})</span>
                                                <span className={tx.type === 'Deposit' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>
                                                    {tx.type === 'Deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-gray-400 flex justify-between font-mono">
                                                <span>Type: {tx.type}</span>
                                                <span>{new Date(tx.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}