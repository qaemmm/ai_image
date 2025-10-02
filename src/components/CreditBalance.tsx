import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CreditInfo {
  credits: number;
  totalEarned: number;
  totalSpent: number;
}

interface Props {
  showDetails?: boolean;
}

export default function CreditBalance({ showDetails = false }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchCreditBalance();
  }, [user]);

  const fetchCreditBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits, total_earned, total_spent')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        // If user doesn't have a credit record yet, show 0 credits
        console.log('No credit record found, showing 0 credits');
        setCreditInfo({ credits: 0, totalEarned: 0, totalSpent: 0 });
      } else {
        setCreditInfo({
          credits: data.credits,
          totalEarned: data.total_earned,
          totalSpent: data.total_spent,
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCreditInfo({ credits: 0, totalEarned: 0, totalSpent: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !creditInfo) {
    return null;
  }

  const isLowCredits = creditInfo.credits < 10;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${isLowCredits ? 'border-orange-300' : 'border-gray-200'} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Credit Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isLowCredits ? 'bg-orange-100' : 'bg-blue-100'
          }`}>
            <svg
              className={`w-6 h-6 ${isLowCredits ? 'text-orange-500' : 'text-blue-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Credit Info */}
          <div>
            <p className="text-sm text-gray-600 font-medium">Credits</p>
            <p className={`text-2xl font-bold ${isLowCredits ? 'text-orange-500' : 'text-gray-900'}`}>
              {creditInfo.credits}
            </p>
          </div>
        </div>

        {/* Buy More Button */}
        <button
          onClick={() => navigate('/pricing')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isLowCredits
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Buy More
        </button>
      </div>

      {/* Low Credits Warning */}
      {isLowCredits && (
        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-700">
            ⚠️ You're running low on credits. Consider purchasing more to continue using all features.
          </p>
        </div>
      )}

      {/* Detailed Stats (optional) */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Earned</p>
            <p className="text-lg font-semibold text-green-600">
              +{creditInfo.totalEarned}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
            <p className="text-lg font-semibold text-red-600">
              -{creditInfo.totalSpent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
