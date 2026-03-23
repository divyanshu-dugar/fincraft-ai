'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/authenticate';

const EditExpense = () => {
  const [expense, setExpense] = useState({
    date: '',
    category: '',
    amount: '',
    note: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();

  const toApiLocalDateTime = (dateString) =>
    dateString ? `${dateString}T00:00:00` : "";

  useEffect(() => {
    fetchCategories();
    fetchExpense();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        setError('Failed to load categories.');
      }
    } catch (err) {
      setError('Error fetching categories.');
    }
  };

  const fetchExpense = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${params._id}`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpense({
          date: data.date.split('T')[0],
          category: data.category?._id || '',
          amount: data.amount,
          note: data.note || '',
        });
      } else {
        setError('Failed to load expense.');
      }
    } catch (err) {
      setError('An error occurred while fetching the expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${params._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify({
          ...expense,
          date: toApiLocalDateTime(expense.date),
          category: expense.category, // sending category ID
        }),
      });

      if (res.ok) {
        setSuccess('Expense updated successfully!');
        setTimeout(() => router.push('/expense/list'), 1000);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to update expense.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Edit Expense
        </h1>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={expense.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={expense.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              name="note"
              value={expense.note}
              onChange={handleChange}
              rows="3"
              placeholder="Optional note..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
