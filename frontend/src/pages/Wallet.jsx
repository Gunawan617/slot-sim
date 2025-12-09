import { useState, useEffect } from 'react';
import { requestTopUp, requestWithdraw, getWalletHistory, getProfile } from '../api';

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('topup');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [topupForm, setTopupForm] = useState({
    amount: '',
    bank_name: '',
    bank_account: '',
    account_name: ''
  });
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bank_name: '',
    bank_account: '',
    account_name: ''
  });

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await getProfile();
      setBalance(res.data.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await getWalletHistory();
      setHistory(res.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestTopUp({
        amount: parseFloat(topupForm.amount),
        bank_name: topupForm.bank_name,
        bank_account: topupForm.bank_account,
        account_name: topupForm.account_name
      });
      alert('Top up request submitted! Waiting for admin approval.');
      setTopupForm({ amount: '', bank_name: '', bank_account: '', account_name: '' });
      fetchHistory();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit top up request');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestWithdraw({
        amount: parseFloat(withdrawForm.amount),
        bank_name: withdrawForm.bank_name,
        bank_account: withdrawForm.bank_account,
        account_name: withdrawForm.account_name
      });
      alert('Withdraw request submitted! Waiting for admin approval.');
      setWithdrawForm({ amount: '', bank_name: '', bank_account: '', account_name: '' });
      setBalance(res.data.new_balance);
      fetchHistory();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit withdraw request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-2xl text-yellow-400">Balance: Rp {balance.toLocaleString()}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('topup')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  activeTab === 'topup'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-white/70'
                }`}
              >
                Top Up
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  activeTab === 'withdraw'
                    ? 'bg-red-600 text-white'
                    : 'bg-white/20 text-white/70'
                }`}
              >
                Withdraw
              </button>
            </div>

            {activeTab === 'topup' ? (
              <form onSubmit={handleTopUp} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Amount (Rp)</label>
                  <input
                    type="number"
                    value={topupForm.amount}
                    onChange={(e) => setTopupForm({ ...topupForm, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                    min="10000"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={topupForm.bank_name}
                    onChange={(e) => setTopupForm({ ...topupForm, bank_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Bank Account</label>
                  <input
                    type="text"
                    value={topupForm.bank_account}
                    onChange={(e) => setTopupForm({ ...topupForm, bank_account: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Account Name</label>
                  <input
                    type="text"
                    value={topupForm.account_name}
                    onChange={(e) => setTopupForm({ ...topupForm, account_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Submit Top Up'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Amount (Rp)</label>
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                    min="10000"
                    max={balance}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={withdrawForm.bank_name}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Bank Account</label>
                  <input
                    type="text"
                    value={withdrawForm.bank_account}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_account: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Account Name</label>
                  <input
                    type="text"
                    value={withdrawForm.account_name}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, account_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Submit Withdraw'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-white/70">No transactions yet</p>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'} Rp {tx.amount.toLocaleString()}
                      </span>
                      <span className={`text-sm font-semibold ${getStatusColor(tx.status)}`}>
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-white/70">
                      <p>{tx.bank_name} - {tx.bank_account}</p>
                      <p>{tx.account_name}</p>
                      <p className="text-xs mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
