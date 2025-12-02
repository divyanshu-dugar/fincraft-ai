'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getToken } from '@/lib/authenticate';

const AddBudget = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    category: '',
    startDate: '',
    endDate: '',
    notifications: true,
    alertThreshold: 80
  });
  const [errors, setErrors] = useState({});

  // Helper function to create a UTC date at midnight
  const createUTCDate = (year, month, day) => {
    return new Date(Date.UTC(year, month, day));
  };

  // Helper function to get Monday of the current week (in user's local time, then convert to UTC)
  const getMondayOfWeek = (dateString) => {
    // Parse the input date in user's local timezone
    const localDate = new Date(dateString + 'T00:00:00');
    const day = localDate.getDay();
    const diff = localDate.getDate() - day + (day === 0 ? -6 : 1);
    
    // Create new date with adjusted day
    const mondayLocal = new Date(localDate);
    mondayLocal.setDate(diff);
    
    // Convert to UTC date string (YYYY-MM-DD)
    return createUTCDate(
      mondayLocal.getFullYear(),
      mondayLocal.getMonth(),
      mondayLocal.getDate()
    );
  };

  // Helper function to get Sunday of the current week
  const getSundayOfWeek = (dateString) => {
    const localDate = new Date(dateString + 'T00:00:00');
    const day = localDate.getDay();
    const diff = localDate.getDate() - day + (day === 0 ? 0 : 7);
    
    const sundayLocal = new Date(localDate);
    sundayLocal.setDate(diff);
    
    return createUTCDate(
      sundayLocal.getFullYear(),
      sundayLocal.getMonth(),
      sundayLocal.getDate()
    );
  };

  // Helper function to get first day of the month
  const getFirstDayOfMonth = (dateString) => {
    const localDate = new Date(dateString + 'T00:00:00');
    return createUTCDate(
      localDate.getFullYear(),
      localDate.getMonth(),
      1
    );
  };

  // Helper function to get last day of the month
  const getLastDayOfMonth = (dateString) => {
    const localDate = new Date(dateString + 'T00:00:00');
    // Get first day of next month, then subtract 1 day
    const nextMonth = new Date(Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth() + 1,
      1
    ));
    const lastDay = new Date(nextMonth);
    lastDay.setUTCDate(nextMonth.getUTCDate() - 1);
    return lastDay;
  };

  // Helper function to get first day of the year
  const getFirstDayOfYear = (dateString) => {
    const localDate = new Date(dateString + 'T00:00:00');
    return createUTCDate(
      localDate.getFullYear(),
      0, // January
      1
    );
  };

  // Helper function to get last day of the year
  const getLastDayOfYear = (dateString) => {
    const localDate = new Date(dateString + 'T00:00:00');
    return createUTCDate(
      localDate.getFullYear(),
      11, // December
      31
    );
  };

  // Format date to YYYY-MM-DD string (local time for display)
  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Format date for display in user's locale
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Show UTC date in display
    });
  };

  // Get today's date in user's local timezone for the date input
  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate date ranges based on period
  const calculateDateRange = (selectedDate, period) => {
    if (!selectedDate) return { startDate: null, endDate: null };
    
    let startDateUTC, endDateUTC;

    switch (period) {
      case 'weekly':
        startDateUTC = getMondayOfWeek(selectedDate);
        endDateUTC = getSundayOfWeek(selectedDate);
        break;
      case 'monthly':
        startDateUTC = getFirstDayOfMonth(selectedDate);
        endDateUTC = getLastDayOfMonth(selectedDate);
        break;
      case 'yearly':
        startDateUTC = getFirstDayOfYear(selectedDate);
        endDateUTC = getLastDayOfYear(selectedDate);
        break;
      default:
        startDateUTC = getFirstDayOfMonth(selectedDate);
        endDateUTC = getLastDayOfMonth(selectedDate);
    }

    return {
      startDate: startDateUTC,
      endDate: endDateUTC
    };
  };

  // Initialize with default dates when component mounts
  useEffect(() => {
    const todayLocal = getTodayLocalDate();
    const { startDate, endDate } = calculateDateRange(todayLocal, 'monthly');
    
    setFormData(prev => ({
      ...prev,
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
      // Set the reference date input to today's local date
      referenceDate: todayLocal
    }));
  }, []);

  // Update date range when period changes
  useEffect(() => {
    if (formData.referenceDate) {
      const { startDate, endDate } = calculateDateRange(formData.referenceDate, formData.period);
      setFormData(prev => ({
        ...prev,
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate)
      }));
    }
  }, [formData.period]);

  // Handle reference date change
  const handleReferenceDateChange = (date) => {
    const { startDate, endDate } = calculateDateRange(date, formData.period);
    
    setFormData(prev => ({
      ...prev,
      referenceDate: date,
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate)
    }));
    
    if (errors.referenceDate) {
      setErrors(prev => ({
        ...prev,
        referenceDate: ''
      }));
    }
  };

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found");
          return;
        }

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

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'referenceDate') {
      handleReferenceDateChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
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

    if (!formData.referenceDate) {
      newErrors.referenceDate = 'Reference date is required';
    }

    if (!formData.startDate || !formData.endDate) {
      newErrors.dateRange = 'Date range calculation failed';
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

    setLoading(true);
    try {
      const token = getToken();
      
      // Send UTC dates to backend
      const budgetData = {
        ...formData,
        // Ensure dates are sent as UTC strings
        startDate: new Date(formData.startDate + 'T00:00:00Z').toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59.999Z').toISOString()
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `jwt ${token}`
        },
        body: JSON.stringify(budgetData)
      });

      if (res.ok) {
        // Redirect to budget list
        router.push('/budget/list');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      alert(error.message || 'Failed to create budget. Please try again.');
    } finally {
      setLoading(false);
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

  // Get date range description for display
  const getDateRangeDescription = () => {
    const startDate = formData.startDate ? new Date(formData.startDate + 'T00:00:00Z') : null;
    const endDate = formData.endDate ? new Date(formData.endDate + 'T00:00:00Z') : null;
    
    if (!startDate || !endDate) return '';
    
    return `${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`;
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Budget</h1>
              <p className="text-gray-600 mt-1">Set spending limits and track your financial goals</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
                  <option value="weekly">Weekly (Mon-Sun)</option>
                  <option value="monthly">Monthly (1st-last)</option>
                  <option value="yearly">Yearly (Jan 1-Dec 31)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.period === 'weekly' && 'Monday to Sunday of selected week'}
                  {formData.period === 'monthly' && '1st to last day of selected month'}
                  {formData.period === 'yearly' && 'January 1 to December 31 of selected year'}
                </p>
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

            {/* Date Range */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-3">
                {formData.period.charAt(0).toUpperCase() + formData.period.slice(1)} Period
              </h3>
              
              <div className="mb-4">
                <label htmlFor="referenceDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Reference Date <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Your local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
                </label>
                <input
                  type="date"
                  id="referenceDate"
                  name="referenceDate"
                  value={formData.referenceDate || getTodayLocalDate()}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.referenceDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.referenceDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.referenceDate}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select any date within the {formData.period}. Dates will be converted to UTC for storage.
                </p>
              </div>

              {/* Auto-calculated Date Range Display */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Calculated Date Range (UTC):</p>
                    <p className="text-sm text-gray-600 mt-1">{getDateRangeDescription()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Duration:</p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{formData.period}</p>
                  </div>
                </div>
                
                {/* Read-only date display */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">Start Date (UTC):</label>
                    <p className="font-medium text-gray-900">{formData.startDate || 'Calculating...'}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">End Date (UTC):</label>
                    <p className="font-medium text-gray-900">{formData.endDate || 'Calculating...'}</p>
                  </div>
                </div>
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
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Budget...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Budget
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
          transition={{ delay: 0.2 }}
          className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-200"
        >
          <h3 className="text-lg font-medium text-purple-900 mb-3">💡 Timezone Handling</h3>
          <ul className="space-y-2 text-purple-800 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              All dates are stored in UTC to ensure consistency across timezones
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              The reference date uses your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Budget periods are calculated based on the selected reference date
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              When viewing budgets, dates will be displayed in your local timezone
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBudget;