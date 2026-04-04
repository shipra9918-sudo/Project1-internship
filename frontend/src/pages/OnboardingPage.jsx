import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CreditCard, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/authStore';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workspaceName: '',
    businessType: 'restaurant',
    teamSize: '1-5',
    plan: 'free'
  });

  const steps = [
    { id: 1, name: 'Workspace', icon: Building2 },
    { id: 2, name: 'Business Info', icon: Users },
    { id: 3, name: 'Choose Plan', icon: CreditCard },
    { id: 4, name: 'Complete', icon: CheckCircle }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // Create workspace
      const workspaceRes = await api.post('/workspaces', {
        name: formData.workspaceName
      });

      // Subscribe to plan
      await api.post('/subscriptions/subscribe', {
        plan: formData.plan,
        billingCycle: 'monthly',
        workspaceId: workspaceRes.data.workspace._id
      });

      toast.success('Workspace created successfully!');
      const role = useAuthStore.getState().user?.role;
      navigate(role === 'courier' ? '/courier/dashboard' : '/merchant/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div key={s.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-red-600 text-white' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-sm mt-2 font-medium ${
                      isActive ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {s.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Workspace */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Workspace
              </h2>
              <p className="text-gray-600 mb-6">
                Let's start by setting up your workspace
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    name="workspaceName"
                    value={formData.workspaceName}
                    onChange={handleChange}
                    placeholder="My Restaurant Business"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be your main workspace name
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tell Us About Your Business
              </h2>
              <p className="text-gray-600 mb-6">
                Help us customize your experience
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cloud_kitchen">Cloud Kitchen</option>
                    <option value="food_court">Food Court</option>
                    <option value="catering">Catering Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="1-5">1-5 people</option>
                    <option value="6-20">6-20 people</option>
                    <option value="21-50">21-50 people</option>
                    <option value="51+">51+ people</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Choose Plan */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 mb-6">
                Start with a plan that fits your needs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setFormData({ ...formData, plan: 'free' })}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                    formData.plan === 'free' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <p className="text-3xl font-bold mb-4">$0<span className="text-sm text-gray-600">/mo</span></p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ 1 Restaurant</li>
                    <li>✓ 100 Orders/month</li>
                    <li>✓ 2 Couriers</li>
                    <li>✓ Basic features</li>
                  </ul>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, plan: 'starter' })}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                    formData.plan === 'starter' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Starter</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      14-day trial
                    </span>
                  </div>
                  <p className="text-3xl font-bold mb-4">$49<span className="text-sm text-gray-600">/mo</span></p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ 3 Restaurants</li>
                    <li>✓ 1,000 Orders/month</li>
                    <li>✓ 10 Couriers</li>
                    <li>✓ Advanced analytics</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                You can change your plan anytime
              </p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set!
              </h2>
              <p className="text-gray-600 mb-8">
                Your workspace <strong>{formData.workspaceName}</strong> is ready to go
              </p>

              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
                <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
                <ul className="space-y-3 text-left text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Access your admin dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Add your first restaurant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Invite team members</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Start accepting orders</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-8 border-t">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !formData.workspaceName}
                className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Go to Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
