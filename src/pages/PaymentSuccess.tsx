import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!user || !sessionId) {
      navigate('/pricing');
      return;
    }

    // Fetch subscription details (optional)
    // This could call a backend endpoint to get subscription info
    setLoading(false);
  }, [user, sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your subscription has been activated and credits have been added to your account.
        </p>

        {/* Subscription Info */}
        {subscriptionInfo && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Subscription Details</h3>
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-gray-900">{subscriptionInfo.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Credits:</span>
                <span className="font-medium text-gray-900">{subscriptionInfo.credits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Billing:</span>
                <span className="font-medium text-gray-900">{subscriptionInfo.interval}</span>
              </div>
            </div>
          </div>
        )}

        {/* Session ID (for reference) */}
        {sessionId && (
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              Reference ID: <span className="font-mono text-xs">{sessionId}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            Back to Home
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
