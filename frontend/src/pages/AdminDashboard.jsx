import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Activity,
  Building2,
  CreditCard,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkspaces: 0,
    totalSubscriptions: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    planDistribution: {},
    recentActivity: []
  });
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription and usage
      const [subRes, usageRes] = await Promise.all([
        api.get('/subscriptions/current'),
        api.get('/subscriptions/usage')
      ]);

      setSubscription(subRes.data.subscription);
      setUsage(usageRes.data.usage);

      // Mock admin stats (in production, fetch from admin API)
      setStats({
        totalWorkspaces: 1,
        totalSubscriptions: 1,
        monthlyRevenue: subRes.data.subscription?.pricing?.monthlyPrice || 0,
        activeUsers: 1,
        planDistribution: {
          [subRes.data.subscription?.plan || 'free']: 1
        },
        recentActivity: []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, trend, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const UsageBar = ({ label, current, limit, color }) => {
    const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
    const isNearLimit = percentage > 80;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">
            {current} / {limit === -1 ? '∞' : limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${isNearLimit ? 'bg-red-500' : color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isNearLimit && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Approaching limit - consider upgrading
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your platform performance</p>
            </div>
            {subscription && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="text-lg font-bold text-red-600 capitalize">
                    {subscription.plan}
                  </p>
                </div>
                {subscription.trial?.isTrialing && (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium">
                      {subscription.trialDaysRemaining} days left in trial
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Building2}
            title="Total Workspaces"
            value={stats.totalWorkspaces}
            trend={12}
            color="bg-blue-500"
          />
          <StatCard
            icon={Users}
            title="Active Users"
            value={stats.activeUsers}
            trend={8}
            color="bg-green-500"
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            trend={15}
            color="bg-purple-500"
          />
          <StatCard
            icon={Package}
            title="Active Subscriptions"
            value={stats.totalSubscriptions}
            trend={5}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage & Limits */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Usage & Limits
              </h2>
              
              {usage && (
                <div>
                  <UsageBar
                    label="Restaurants"
                    current={usage.restaurants.current}
                    limit={usage.restaurants.limit}
                    color="bg-blue-500"
                  />
                  <UsageBar
                    label="Orders This Month"
                    current={usage.orders.current}
                    limit={usage.orders.limit}
                    color="bg-green-500"
                  />
                  <UsageBar
                    label="Couriers"
                    current={usage.couriers.current}
                    limit={usage.couriers.limit}
                    color="bg-purple-500"
                  />
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* Plan Distribution Chart */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Plan Distribution
              </h2>
              
              <div className="space-y-4">
                {Object.entries(stats.planDistribution).map(([plan, count]) => (
                  <div key={plan}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {plan}
                      </span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalSubscriptions) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Subscription Info */}
            {subscription && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Subscription
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium capitalize">{subscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing</span>
                    <span className="font-medium capitalize">
                      {subscription.pricing?.billingCycle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">
                      ${subscription.pricing?.monthlyPrice}/mo
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                  <button
                    onClick={() => navigate('/settings/billing')}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Manage Billing
                  </button>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
                  >
                    Change Plan
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/workspace/settings')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
                >
                  <p className="font-medium text-gray-900">Workspace Settings</p>
                  <p className="text-sm text-gray-600">Manage workspace details</p>
                </button>
                <button
                  onClick={() => navigate('/team')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
                >
                  <p className="font-medium text-gray-900">Team Management</p>
                  <p className="text-sm text-gray-600">Invite and manage team members</p>
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
                >
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">View detailed reports</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
