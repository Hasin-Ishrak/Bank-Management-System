'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function CustomerDashboard() {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    
    // Transfer Form States
    const [targetAccount, setTargetAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [transferring, setTransferring] = useState(false);

    // Fetch account details and metrics
    const fetchDashboardData = async () => {
        try {
            const profileRes = await api.get('/account/profile');
            setProfile(profileRes.data.data);

            // Fetch transactional context via metrics route if account exists
            const metricsRes = await api.get('/report/dashboard/metrics');
            // Filter down transactions that belong strictly to this account number
            const myTx = metricsRes.data.transactionReport.filter(
                tx => tx.account_number === profileRes.data.data.account_number
            );
            setTransactions(myTx);
        } catch (error) {
            console.error('Error compiling dashboard details:', error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setFormMessage({ type: '', text: '' });
        setTransferring(true);

        try {
            await api.post('/transaction/transfer', {
                source_account_number: profile.account_number,
                target_account_number: targetAccount,
                amount: amount
            });

            setFormMessage({ type: 'success', text: 'Fund transfer completed successfully!' });
            setTargetAccount('');
            setAmount('');
            // Refresh balance and transaction log views
            fetchDashboardData();
        } catch (error) {
            setFormMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Transfer validation or runtime failure.' 
            });
        } finally {
            setTransferring(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Customer']}>
            <div className="min-h-screen bg-gray-100">
                {/* Header Navbar */}
                <nav className="bg-blue-800 p-4 text-white shadow-md flex justify-between items-center">
                    <h1 className="text-xl font-bold">Secure Customer Core Portal</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm bg-blue-700 px-3 py-1 rounded">User: {profile?.username}</span>
                        <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded font-medium transition">
                            Log Out
                        </button>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left & Middle Column: Profile details & Balance */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Account Balance Card */}
                        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500">
                            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Available Balance</h2>
                            <p className="text-4xl font-extrabold text-gray-900 mt-2">
                                ${profile?.balance ? parseFloat(profile.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-600">
                                <div>Account Ref: <span className="font-mono font-bold text-gray-900">{profile?.account_number || 'No active account'}</span></div>
                                <div>Status: <span className="text-emerald-600 font-semibold">{profile?.status}</span></div>
                            </div>
                        </div>

                        {/* Recent Transactions List */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Activity Logs</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-400 font-medium">
                                            <th className="pb-3">Type</th>
                                            <th className="pb-3">Amount</th>
                                            <th className="pb-3">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="py-4 text-center text-gray-400">No recent transactions recorded.</td>
                                            </tr>
                                        ) : (
                                            transactions.map((tx) => (
                                                <tr key={tx.id} className="text-gray-700">
                                                    <td className="py-3 font-medium">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                                            tx.type === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className={`py-3 font-semibold ${tx.type === 'Deposit' ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {tx.type === 'Deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 text-gray-400 font-mono text-xs">
                                                        {new Date(tx.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Fund Transfer Operations Form */}
                    <div className="bg-white rounded-xl shadow p-6 h-fit">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Execute Fund Transfer</h3>
                        
                        {formMessage.text && (
                            <div className={`p-3 rounded mb-4 text-xs font-semibold border ${
                                formMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {formMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Target Account Number</label>
                                <input 
                                    type="text"
                                    required
                                    value={targetAccount}
                                    onChange={(e) => setTargetAccount(e.target.value)}
                                    placeholder="Enter 12-digit reference"
                                    className="w-full font-mono border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Amount ($)</label>
                                <input 
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={transferring || !profile?.account_number}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm transition disabled:bg-gray-300"
                            >
                                {transferring ? 'Processing ACID Lock...' : 'Authorize Transfer'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}