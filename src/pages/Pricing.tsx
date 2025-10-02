import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRICING_PLANS, FAQ_ITEMS } from '../config/pricing';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePurchase = async (planId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/pricing', planId } });
      return;
    }

    try {
      const interval = isYearly ? 'year' : 'month';

      // Call backend to create checkout session
      const response = await fetch('http://localhost:3001/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          interval,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Creem checkout page
        window.location.href = data.checkoutUrl;
      } else {
        alert('Failed to create checkout session. Please try again.');
        console.error('Checkout error:', data);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Unlimited creativity starts here
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isYearly
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                isYearly
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PRICING_PLANS.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const originalYearlyPrice = plan.monthlyPrice * 12;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">${price}</span>
                      <span className="text-gray-600">/{isYearly ? 'year' : 'month'}</span>
                    </div>
                    {isYearly && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 line-through">
                          ${originalYearlyPrice}/year
                        </span>
                        <span className="ml-2 text-sm font-semibold text-green-600">
                          Save ${originalYearlyPrice - plan.yearlyPrice}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {user ? 'Purchase Now' : 'Sign in to purchase'}
                  </button>

                  {/* Features */}
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
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
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Have more questions?{' '}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:underline font-semibold"
            >
              We're here to help
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
