'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function EmployeeDashboard() {
    const { logout } = useAuth();
    
    // Core Workflow Lists
    const [accounts, setAccounts] = useState([]);
    
    // Account Creation States
    const [newUserId, setNewUserId] = useState('');
    const [initialDeposit, setInitialDeposit] = useState('');
    
    // Counter Transaction States (Deposits/Withdrawals)
    const [targetAccount, setTargetAccount] = useState('');
    const [txType, setTxType] = useState('Deposit');
    const [txAmount, setTxAmount] = useState('');

    // Notification Feedback Status
    const [notification, setNotification] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const loadEmployeeData = async () => {
        try {
            const metricsRes = await api.get('/report/dashboard/metrics');
            setAccounts(metricsRes.data.accountSummaryReport);
        } catch (error) {
            console.error('Failed to load employee metrics view:', error);
        }
    };

    useEffect(() => {
        loadEmployeeData();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setNotification({ type: '', text: '' });
        setLoading(true);

        try {
            const response = await api.post('/account/create', {
                user_id: newUserId,
                initial_deposit: initialDeposit || 0
            });
            setNotification({ 
                type: 'success', 
                text: `Account opened! Number: ${response.data.account_number}` 
            });
            setNewUserId('');
            setInitialDeposit('');
            loadEmployeeData();
        } catch (error) {
            setNotification({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to spawn new client account.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCounterTransaction = async (e) => {
        e.preventDefault();
        setNotification({ type: '', text: '' });
        setLoading(true);

        const endpoint = txType === 'Deposit' ? '/transaction/deposit' : '/transaction/withdraw';

        try {
            await api.post(endpoint, {
                account_number: targetAccount,
                amount: txAmount
            });
            setNotification({ 
                type: 'success', 
                text: `Counter ${txType} processed successfully!` 
            });
            setTargetAccount('');
            setTxAmount('');
            loadEmployeeData();
        } catch (error) {
            setNotification({ 
                type: 'error', 
                text: error.response?.data?.message || 'Transaction processing execution error.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Employee']}>
            <div className="min-h-screen bg-gray-100">
                {/* Navbar */}
                <nav className="bg-teal-800 p-4 text-white shadow flex justify-between items-center">
                    <h1 className="text-xl font-bold font-sans">Staff Over-The-Counter Terminal</h1>
                    <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded transition">
                        Sign Out Terminal
                    </button>
                </nav>

                <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Feedback Alerts */}
                    {notification.text && (
                        <div className={`lg:col-span-3 p-3 rounded font-semibold text-sm border ${
                            notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {notification.text}
                        </div>
                    )}

                    {/* Left Forms Panel */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* 1. Account Initialization Form */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="text-md font-bold text-gray-800 mb-4">Initialize Customer Account</h3>
                            <form onSubmit={handleCreateAccount} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Target User ID</label>
                                    <input 
                                        type="number" required value={newUserId}
                                        onChange={(e) => setNewUserId(e.target.value)}
                                        className="w-full border rounded p-2 text-sm focus:ring-1 focus:ring-teal-600 outline-none"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Initial Deposit Amount ($)</label>
                                    <input 
                                        type="number" min="0" step="0.01" value={initialDeposit}
                                        onChange={(e) => setInitialDeposit(e.target.value)}
                                        className="w-full border rounded p-2 text-sm focus:ring-1 focus:ring-teal-600 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-2 rounded text-sm transition">
                                    Open New Account
                                </button>
                            </form>
                        </div>

                        {/* 2. Manual Deposit/Withdrawal Module */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="text-md font-bold text-gray-800 mb-4">Process Counter Transaction</h3>
                            <form onSubmit={handleCounterTransaction} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Account Number</label>
                                    <input 
                                        type="text" required value={targetAccount}
                                        onChange={(e) => setTargetAccount(e.target.value)}
                                        className="w-full font-mono border rounded p-2 text-sm focus:ring-1 focus:ring-teal-600 outline-none"
                                        placeholder="Enter 12-digit number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Transaction Target Operation</label>
                                    <select value={txType} onChange={(e) => setTxType(e.target.value)} className="w-full border rounded p-2 text-sm outline-none">
                                        <option value="Deposit">Manual Over-the-Counter Deposit</option>
                                        <option value="Withdrawal">Manual Over-the-Counter Withdrawal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Amount ($)</label>
                                    <input 
                                        type="number" required min="0.01" step="0.01" value={txAmount}
                                        onChange={(e) => setTxAmount(e.target.value)}
                                        className="w-full border rounded p-2 text-sm focus:ring-1 focus:ring-teal-600 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded text-sm transition">
                                    Execute Transaction Override
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Directory Lookup Panel */}
                    <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
                        <h3 className="text-md font-bold text-gray-800 mb-4">Bank Core Accounts Registry</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-400">
                                        <th className="pb-3">Client Holder</th>
                                        <th className="pb-3">Account Number</th>
                                        <th className="pb-3">Available Balance</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {accounts.map((acc, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-3 font-medium">{acc.username}</td>
                                            <td className="py-3 font-mono text-xs">{acc.account_number}</td>
                                            <td className="py-3 font-semibold text-gray-900">${parseFloat(acc.balance).toFixed(2)}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    acc.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {acc.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}