'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useCategories } from '@/lib/hooks/useCategories';
import { restoreDefaultCategories } from '@/lib/utils/defaultCategoriesManager';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { CategoryList } from '@/components/categories/CategoryList';

export default function IncomeCategoryPage() {
  const {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories('/income-categories');

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ name: '', color: '#10B981' });

  useEffect(() => {
    fetchCategories().catch(() => {
      toast.error('Failed to load categories');
    });
  }, []);

  const handleAddCategory = async (data) => {
    setSubmitting(true);
    try {
      await addCategory(data.name, data.color);
      toast.success('Category added successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingId(category._id);
    setEditingData({ name: category.name, color: category.color });
  };

  const handleUpdateCategory = async (data) => {
    setSubmitting(true);
    try {
      await updateCategory(editingId, data);
      toast.success('Category updated successfully!');
      setEditingId(null);
      setEditingData({ name: '', color: '#10B981' });
    } catch (error) {
      toast.error(error.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setDeleting(id);
    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({ name: '', color: '#10B981' });
  };

  const handleRestoreDefaults = async () => {
    setSubmitting(true);
    try {
      await restoreDefaultCategories('/income-categories');
      await fetchCategories();
      toast.success('Default income categories restored!');
    } catch (error) {
      toast.error(error.message || 'Failed to restore categories');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50/30 px-4 py-8 sm:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Income Categories
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Organize your income streams with custom categories. Choose unique colors to
            easily identify your earnings sources.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {editingId ? 'Edit Income Category' : 'Add New Income Category'}
            </h2>

            <CategoryForm
              onSubmit={editingId ? handleUpdateCategory : handleAddCategory}
              initialName={editingData.name}
              initialColor={editingData.color}
              loading={submitting}
              existingCategories={categories}
              editingId={editingId}
            />

            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="w-full mt-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel Edit
              </button>
            )}
          </motion.div>

          {/* Category List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Categories</h2>
              <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                {categories.length}
              </span>
            </div>

            <CategoryList
              categories={categories}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteCategory}
              deleting={deleting}
              onRestore={handleRestoreDefaults}
              isRestoring={submitting}
            />

            {/* Tips */}
            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
              <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Tips
              </h3>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Use distinct colors for better visual separation</li>
                <li>• Edit or delete categories as needed</li>
                <li>• Green tones work well for income-related categories</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}