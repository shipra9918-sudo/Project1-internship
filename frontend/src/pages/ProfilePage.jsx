import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Star, Award, Edit2, Save, X } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', formData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600 capitalize">{user?.role}</p>
                
                {/* Stats */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-semibold text-gray-900">{user?.totalOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {user?.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Loyalty Points</span>
                    <span className="font-semibold text-yellow-600 flex items-center">
                      <Award className="h-4 w-4 text-yellow-500 mr-1" />
                      {user?.loyaltyPoints || 0} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{loading ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-5 w-5" />
                      <span>{user?.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <User className="h-5 w-5" />
                        <span>{user?.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Phone className="h-5 w-5" />
                        <span>{user?.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                    
                    {editing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          name="address.street"
                          placeholder="Street Address"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="address.city"
                            placeholder="City"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            name="address.state"
                            placeholder="State"
                            value={formData.address.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          name="address.zipCode"
                          placeholder="ZIP Code"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2 text-gray-900">
                        <MapPin className="h-5 w-5 mt-0.5" />
                        <div>
                          {user?.address?.street ? (
                            <>
                              <p>{user.address.street}</p>
                              <p className="text-gray-600">
                                {user.address.city}, {user.address.state} {user.address.zipCode}
                              </p>
                            </>
                          ) : (
                            <p className="text-gray-500">No address provided</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
