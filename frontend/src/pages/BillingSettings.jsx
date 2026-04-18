import { useState, useEffect } from 'react';
import { CreditCard, Download, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const BillingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);


  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [subRes, invoicesRes] = await Promise.all([
        api.get('/subscriptions/current'),
        api.get('/subscriptions/invoices')
      ]);

      setSubscription(subRes.data.subscription);
      setInvoices(invoicesRes.data.invoices || []);
    } catch (error) {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const workspacesRes = await api.get('/workspaces');
      const workspaceId = workspacesRes.data.workspaces[0]._id;

      await api.post('/subscriptions/cancel', { workspaceId });
      toast.success('Subscription will be canceled at the end of billing period');
      setShowCancelModal(false);
      fetchBillingData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Current Plan
          </h2>

          {subscription && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-2xl font-bold capitalize">{subscription.plan}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold">
                    ${subscription.pricing?.monthlyPrice}
                    <span className="text-sm text-gray-600">/mo</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
                  <p className="font-medium capitalize">{subscription.pricing?.billingCycle}</p>
                </div>
              </div>

              {subscription.trial?.isTrialing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Trial Period Active</p>
                      <p className="text-sm text-yellow-700">
                        {subscription.trialDaysRemaining} days remaining in your free trial
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Change Plan
                </button>
                {subscription.plan !== 'free' && subscription.status !== 'canceled' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Method
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No payment method on file</p>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition">
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Billing History
          </h2>

          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        ${invoice.amount.total}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center ml-auto">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Subscription?</h3>
            <p className="text-gray-600 mb-6">
              Your subscription will remain active until the end of the current billing period.
              You'll lose access to premium features after that.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSettings;
