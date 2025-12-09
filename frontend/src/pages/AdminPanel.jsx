import { useState, useEffect } from 'react';
import { getAdminTransactions, processTransaction, getAdminDashboard } from '../api';

export default function AdminPanel() {
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchTransactions();
  }, [filter]);

  const fetchDashboard = async () => {
    try {
      const res = await getAdminDashboard();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await getAdminTransactions(filter);
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleProcess = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;
    
    setLoading(true);
    try {
      await processTransaction(id, action);
      alert(`Transaction ${action}d successfully!`);
      fetchTransactions();
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.error || `Failed to ${action} transaction`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <p className="text-white/70 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.total_users || 0}</p>
          </div>
          <div className="bg-yellow-600/20 backdrop-blur-md rounded-xl p-4 border border-yellow-600/50">
            <p className="text-white/70 text-sm">Pending Deposits</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending_deposits || 0}</p>
          </div>
          <div className="bg-orange-600/20 backdrop-blur-md rounded-xl p-4 border border-orange-600/50">
            <p className="text-white/70 text-sm">Pending Withdraws</p>
            <p className="text-2xl font-bold text-orange-400">{stats.pending_withdraws || 0}</p>
          </div>
          <div className="bg-green-600/20 backdrop-blur-md rounded-xl p-4 border border-green-600/50">
            <p className="text-white/70 text-sm">Total Deposits</p>
            <p className="text-2xl font-bold text-green-400">Rp {(stats.total_deposits || 0).toLocaleString()}</p>
          </div>
          <div className="bg-red-600/20 backdrop-blur-md rounded-xl p-4 border border-red-600/50">
            <p className="text-white/70 text-sm">Total Withdraws</p>
            <p className="text-2xl font-bold text-red-400">Rp {(stats.total_withdraws || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white/20 text-white/70'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/20 text-white/70'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/20 text-white/70'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/20 text-white/70'
              }`}
            >
              All
            </button>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">User ID</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Bank Info</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-white/50">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">{tx.id}</td>
                      <td className="py-3 px-4">{tx.user_id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          tx.type === 'deposit' ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">Rp {tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>{tx.bank_name}</div>
                        <div className="text-white/70">{tx.bank_account}</div>
                        <div className="text-white/70">{tx.account_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          tx.status === 'approved' ? 'bg-green-600/30 text-green-400' :
                          tx.status === 'rejected' ? 'bg-red-600/30 text-red-400' :
                          'bg-yellow-600/30 text-yellow-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {tx.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProcess(tx.id, 'approve')}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcess(tx.id, 'reject')}
                              disabled={loading}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
