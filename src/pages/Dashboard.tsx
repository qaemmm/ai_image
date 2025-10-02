import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CreditBalance from '../components/CreditBalance';
import { CREDIT_COSTS } from '../config/pricing';

interface Subscription {
  id: string;
  plan_name: string;
  interval: string;
  status: string;
  current_period_end: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      setSubscription(subData);

      // Fetch recent transactions
      const { data: txData } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(txData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '💳';
      case 'compress':
        return '🗜️';
      case 'remove_bg':
        return '✂️';
      case 'recognize':
        return '👁️';
      case 'generate':
        return '🎨';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your subscription and credits</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Home
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credit Balance */}
            <CreditBalance showDetails={true} />

            {/* Subscription Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription</h2>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {subscription.plan_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {subscription.interval}ly
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Renews on:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/pricing')}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You don't have an active subscription</p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tx.description || tx.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${getTransactionColor(tx.amount)}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No transactions yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/compress')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🗜️</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">Compress</p>
                    <p className="text-sm text-gray-600">{CREDIT_COSTS.compress} credit</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/remove-bg')}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">✂️</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">Remove Background</p>
                    <p className="text-sm text-gray-600">{CREDIT_COSTS.removeBg} credits</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/recognize')}
                  className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">👁️</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">Recognize</p>
                    <p className="text-sm text-gray-600">{CREDIT_COSTS.recognize} credits</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/ai-generate')}
                  className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🎨</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">AI Generate</p>
                    <p className="text-sm text-gray-600">{CREDIT_COSTS.generate} credits</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Credit Costs Reference */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-lg mb-3">Credit Costs</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Compress:</span>
                  <span className="font-semibold">{CREDIT_COSTS.compress} credit</span>
                </div>
                <div className="flex justify-between">
                  <span>Remove BG:</span>
                  <span className="font-semibold">{CREDIT_COSTS.removeBg} credits</span>
                </div>
                <div className="flex justify-between">
                  <span>Recognize:</span>
                  <span className="font-semibold">{CREDIT_COSTS.recognize} credits</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Generate:</span>
                  <span className="font-semibold">{CREDIT_COSTS.generate} credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
