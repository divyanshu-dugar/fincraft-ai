'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getToken } from '@/lib/authenticate';

const EditBudget = () => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    category: '',
    startDate: '',
    endDate: '',
    notifications: true,
    alertThreshold: 80,
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [budget, setBudget] = useState(null);

  // Calculate default end date based on period
  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      
      if (formData.period === 'weekly') {
        end.setDate(start.getDate() + 7);
      } else if (formData.period === 'monthly') {
        end.setMonth(start.getMonth() + 1);
      } else if (formData.period === 'yearly') {
        end.setFullYear(start.getFullYear() + 1);
      }
      
      setFormData(prev => ({
        ...prev,
        endDate: end.toLocaleDateString('en-CA')
      }));
    }
  }, [formData.startDate, formData.period]);

  // Fetch budget data and categories
  useEffect(() => {
    fetchCategories();
    fetchBudget();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `jwt ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchBudget = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${params.id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `jwt ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setBudget(data);
        
        // Format dates for input fields
        const startDate = new Date(data.startDate).toLocaleDateString('en-CA');
        const endDate = new Date(data.endDate).toLocaleDateString('en-CA');
        
        setFormData({
          name: data.name || '',
          amount: data.amount || '',
          period: data.period || 'monthly',
          category: data.category?._id || '',
          startDate: startDate,
          endDate: endDate,
          notifications: data.notifications !== undefined ? data.notifications : true,
          alertThreshold: data.alertThreshold || 80,
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      } else {
        throw new Error('Failed to load budget');
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      alert('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.alertThreshold < 0 || formData.alertThreshold > 100) {
      newErrors.alertThreshold = 'Alert threshold must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `jwt ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // Redirect to budget list
        router.push('/budget/list');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      alert(error.message || 'Failed to update budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Quick amount suggestions based on period
  const getQuickAmounts = () => {
    switch (formData.period) {
      case 'weekly':
        return [50, 100, 200, 500];
      case 'monthly':
        return [500, 1000, 2000, 5000];
      case 'yearly':
        return [10000, 20000, 50000, 100000];
      default:
        return [100, 200, 500, 1000];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50/30 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Budgets
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Budget</h1>
              <p className="text-gray-600 mt-1">Update your spending limits and tracking preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Budget Stats Preview */}
        {budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Spent so far:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  ${(budget.currentSpent || 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  ${Math.max((budget.amount || 0) - (budget.currentSpent || 0), 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Usage:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {((budget.currentSpent || 0) / (budget.amount || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ml-2 ${
                  (budget.currentSpent || 0) >= (budget.amount || 0) 
                    ? 'text-red-600' 
                    : (budget.currentSpent || 0) >= (budget.amount || 0) * 0.8 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                }`}>
                  {(budget.currentSpent || 0) >= (budget.amount || 0) 
                    ? 'Exceeded' 
                    : (budget.currentSpent || 0) >= (budget.amount || 0) * 0.8 
                    ? 'Almost Exceeded' 
                    : 'On Track'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Budget Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Budget Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Groceries Budget, Entertainment, Travel..."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Expense Category <span className="text-red-500">*</span>
              </label>
              
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Period and Amount in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Period */}
              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Period <span className="text-red-500">*</span>
                </label>
                <select
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Amount Field */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
            </div>

            {/* Date Range in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Amounts ({formData.period})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {getQuickAmounts().map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Budget Status
                </label>
                <p className="text-xs text-gray-500">Active budgets are tracked and can trigger alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Alert Settings */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h3 className="text-sm font-medium text-purple-900 mb-3">Alert Settings</h3>
              
              {/* Notifications Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                    Enable Notifications
                  </label>
                  <p className="text-xs text-gray-500">Get alerts when approaching budget limits</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="notifications"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Alert Threshold */}
              {formData.notifications && (
                <div>
                  <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Threshold <span className="text-gray-500">({formData.alertThreshold}%)</span>
                  </label>
                  <input
                    type="range"
                    id="alertThreshold"
                    name="alertThreshold"
                    min="0"
                    max="100"
                    value={formData.alertThreshold}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>Get alert at {formData.alertThreshold}% usage</span>
                    <span>100%</span>
                  </div>
                  {errors.alertThreshold && (
                    <p className="mt-1 text-sm text-red-600">{errors.alertThreshold}</p>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Budget...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Budget
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-200"
        >
          <h3 className="text-lg font-medium text-purple-900 mb-3">💡 Budget Management Tips</h3>
          <ul className="space-y-2 text-purple-800 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Consider your actual spending patterns when adjusting budget amounts
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Temporarily disable budgets for categories you're not currently tracking
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Set alert thresholds that give you enough time to adjust your spending
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Review budget performance regularly and adjust as needed
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default EditBudget;