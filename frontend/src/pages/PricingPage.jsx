import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Crown, Rocket, Star } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PricingPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Star,
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: 'gray',
      features: [
        { text: '1 Restaurant', included: true },
        { text: '100 Orders/month', included: true },
        { text: '2 Couriers', included: true },
        { text: 'Basic Analytics', included: false },
        { text: 'Custom Branding', included: false },
        { text: 'API Access', included: false },
        { text: 'Priority Support', included: false },
        { text: 'White Label', included: false }
      ],
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      description: 'For growing businesses',
      monthlyPrice: 49,
      yearlyPrice: 470,
      color: 'blue',
      features: [
        { text: '3 Restaurants', included: true },
        { text: '1,000 Orders/month', included: true },
        { text: '10 Couriers', included: true },
        { text: 'Advanced Analytics', included: true },
        { text: 'Custom Branding', included: true },
        { text: 'API Access', included: false },
        { text: 'Priority Support', included: false },
        { text: 'White Label', included: false }
      ],
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Crown,
      description: 'For established businesses',
      monthlyPrice: 149,
      yearlyPrice: 1430,
      color: 'purple',
      features: [
        { text: '10 Restaurants', included: true },
        { text: '10,000 Orders/month', included: true },
        { text: '50 Couriers', included: true },
        { text: 'Advanced Analytics', included: true },
        { text: 'Custom Branding', included: true },
        { text: 'Full API Access', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Custom Domain', included: true }
      ],
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Rocket,
      description: 'For large organizations',
      monthlyPrice: 499,
      yearlyPrice: 4790,
      color: 'red',
      features: [
        { text: 'Unlimited Restaurants', included: true },
        { text: 'Unlimited Orders', included: true },
        { text: 'Unlimited Couriers', included: true },
        { text: 'Advanced Analytics', included: true },
        { text: 'Custom Branding', included: true },
        { text: 'Full API Access', included: true },
        { text: 'Dedicated Support', included: true },
        { text: 'White Label Solution', included: true }
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);

      // Get or create workspace first
      const workspacesRes = await api.get('/workspaces');
      let workspaceId;

      if (workspacesRes.data.workspaces.length === 0) {
        // Create workspace
        const createRes = await api.post('/workspaces', {
          name: 'My Workspace'
        });
        workspaceId = createRes.data.workspace._id;
      } else {
        workspaceId = workspacesRes.data.workspaces[0]._id;
      }

      // Subscribe to plan
      const response = await api.post('/subscriptions/subscribe', {
        plan: planId,
        billingCycle,
        workspaceId
      });

      toast.success(response.data.message);
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan) => {
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    return price;
  };

  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.monthlyPrice > 0) {
      const yearlyTotal = plan.monthlyPrice * 12;
      const savings = yearlyTotal - plan.yearlyPrice;
      return Math.round((savings / yearlyTotal) * 100);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start with a 14-day free trial. No credit card required.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  plan.popular ? 'ring-2 ring-red-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-red-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  {/* Icon & Name */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${plan.color}-100`}>
                      <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                    </div>
                    {savings > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Save {savings}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        ${price}
                      </span>
                      <span className="text-gray-600 ml-2">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        ${Math.round(price / 12)}/month billed annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-medium transition ${
                      plan.popular
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Processing...' : plan.id === 'free' ? 'Get Started' : 'Start Free Trial'}
                  </button>

                  {/* Features */}
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely. You can cancel your subscription at any time with no penalties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there any processing fee?
              </h3>
              <p className="text-gray-600 text-sm">
                No, there are no additional processing fees. You will only be charged the subscription price.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Trusted by 10,000+ businesses worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-50">
            <div className="text-2xl font-bold text-gray-400">VISA</div>
            <div className="text-2xl font-bold text-gray-400">Mastercard</div>
            <div className="text-2xl font-bold text-gray-400">PayPal</div>
            <div className="text-2xl font-bold text-gray-400">Stripe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
