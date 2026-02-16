'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken } from '@/lib/authenticate';

export const QuickCategoryModal = ({
  isOpen,
  onClose,
  endpoint,
  onCategoryCreated,
  existingCategories = [],
  defaultColor = '#3b82f6',
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(defaultColor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getColorBrightness = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Category name is required');
      return false;
    }

    // Check for duplicate name
    const isDuplicate = existingCategories.some(
      (cat) => cat.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError('This category name already exists');
      return false;
    }

    // Check for duplicate color
    const isDuplicateColor = existingCategories.some(
      (cat) => cat.color.toLowerCase() === color.toLowerCase()
    );

    if (isDuplicateColor) {
      setError('This color is already used by another category');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), color }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create category');
      }

      const data = await res.json();
      
      // Call the callback with the created category
      if (onCategoryCreated) {
        onCategoryCreated(data.category);
      }

      // Reset form and close modal
      setName('');
      setColor(defaultColor);
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setColor(defaultColor);
      setError('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Category</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Groceries, Dining..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setError('');
                    }}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                    disabled={loading}
                  />
                  <span
                    className="text-sm font-medium px-3 py-2 rounded-lg border text-center flex-1"
                    style={{
                      backgroundColor: color,
                      color: getColorBrightness(color) > 128 ? '#000' : '#fff',
                      borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
                    }}
                  >
                    {color.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
