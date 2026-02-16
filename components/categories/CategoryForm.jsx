'use client';

import { useState, useEffect } from 'react';

export const CategoryForm = ({
  onSubmit,
  initialName = '',
  initialColor = '#3b82f6',
  loading = false,
  existingCategories = [],
  editingId = null,
}) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialName);
    setColor(initialColor);
    setError('');
  }, [initialName, initialColor]);

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

    // Check for duplicate name (excluding current category if editing)
    const isDuplicate = existingCategories.some(
      (cat) => cat.name.toLowerCase() === name.trim().toLowerCase() && cat._id !== editingId
    );

    if (isDuplicate) {
      setError('This category name already exists');
      return false;
    }

    // Check for duplicate color (excluding current category if editing)
    const isDuplicateColor = existingCategories.some(
      (cat) => cat.color.toLowerCase() === color.toLowerCase() && cat._id !== editingId
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

    try {
      await onSubmit({ name: name.trim(), color });
      setName('');
      setColor('#3b82f6');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Category Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="Enter category name..."
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          disabled={loading}
        />
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Category Color
        </label>
        <div className="flex items-center gap-4 mb-3">
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
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium px-3 py-1 rounded-full border"
              style={{
                backgroundColor: color,
                color: getColorBrightness(color) > 128 ? '#000' : '#fff',
                borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
              }}
            >
              Preview
            </span>
            <span className="text-sm text-gray-600 font-mono">{color.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 px-4 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            {editingId ? 'Updating...' : 'Adding...'}
          </>
        ) : editingId ? (
          'Update Category'
        ) : (
          'Add Category'
        )}
      </button>
    </form>
  );
};
