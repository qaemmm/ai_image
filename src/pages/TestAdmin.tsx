import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TestAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const plans = [
    { id: 'basic', name: 'Basic', credits: 150 },
    { id: 'pro', name: 'Pro', credits: 400 },
    { id: 'max', name: 'Max', credits: 1000 },
  ];

  const handleGrantSubscription = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please login first' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3001/api/test/grant-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          planId: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `✅ ${data.message}`,
        });
        // Refresh user info
        fetchUserInfo();
      } else {
        setMessage({
          type: 'error',
          text: `❌ ${data.error || 'Failed to grant subscription'}`,
        });
      }
    } catch (error) {
      console.error('Grant error:', error);
      setMessage({
        type: 'error',
        text: '❌ Network error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:3001/api/test/user-credits/${user.id}`);
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Auto-fetch user info on mount
  useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🧪 Test Admin Panel</h1>
            <p className="text-gray-300">Development testing - Grant subscriptions without payment</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Warning Banner */}
        <div className="mb-8 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
          <p className="font-semibold text-yellow-300">
            ⚠️ Development Only - This page should not be accessible in production
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Grant Subscription Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-6">Grant Subscription</h2>

            {user ? (
              <>
                <div className="mb-6 p-4 bg-blue-500/20 rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Current User:</p>
                  <p className="font-semibold">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {user.id}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Select Plan:</label>
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <label
                        key={plan.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={selectedPlan === plan.id}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="w-5 h-5"
                          />
                          <div>
                            <p className="font-semibold">{plan.name}</p>
                            <p className="text-sm text-gray-300">{plan.credits} credits</p>
                          </div>
                        </div>
                        <div className="text-2xl">
                          {plan.id === 'basic' && '🥉'}
                          {plan.id === 'pro' && '🥈'}
                          {plan.id === 'max' && '🥇'}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGrantSubscription}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : '🎁 Grant Subscription'}
                </button>

                {message && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-500/20 border border-green-500'
                        : 'bg-red-500/20 border border-red-500'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">Please login to use this panel</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>

          {/* User Info Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">User Info</h2>
              <button
                onClick={fetchUserInfo}
                disabled={!user}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>

            {userInfo ? (
              <div className="space-y-4">
                {/* Credits */}
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500">
                  <p className="text-sm text-gray-300 mb-1">Credits</p>
                  <p className="text-3xl font-bold">{userInfo.credits.credits}</p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="text-green-400">+{userInfo.credits.total_earned} earned</span>
                    <span className="text-red-400">-{userInfo.credits.total_spent} spent</span>
                  </div>
                </div>

                {/* Subscription */}
                <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500">
                  <p className="text-sm text-gray-300 mb-2">Subscription</p>
                  {userInfo.subscription ? (
                    <>
                      <p className="font-semibold capitalize">{userInfo.subscription.plan_name} Plan</p>
                      <p className="text-sm text-gray-300 mt-1">
                        Status: <span className="text-green-400">{userInfo.subscription.status}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Expires: {new Date(userInfo.subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">No active subscription</p>
                  )}
                </div>

                {/* Recent Transactions */}
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500">
                  <p className="text-sm text-gray-300 mb-3">Recent Transactions</p>
                  {userInfo.recentTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {userInfo.recentTransactions.map((tx: any) => (
                        <div key={tx.id} className="flex justify-between text-sm">
                          <span className="truncate mr-2">{tx.description}</span>
                          <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No transactions yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Click refresh to load user info</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500 transition-all text-left"
            >
              <p className="font-semibold mb-1">📊 Dashboard</p>
              <p className="text-sm text-gray-300">View your dashboard</p>
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500 transition-all text-left"
            >
              <p className="font-semibold mb-1">💳 Pricing</p>
              <p className="text-sm text-gray-300">View pricing plans</p>
            </button>
            <button
              onClick={() => navigate('/compress')}
              className="p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500 transition-all text-left"
            >
              <p className="font-semibold mb-1">🗜️ Test Features</p>
              <p className="text-sm text-gray-300">Try image compression</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
