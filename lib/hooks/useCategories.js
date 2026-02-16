import { useState, useCallback } from 'react';
import { getToken } from '@/lib/authenticate';

export const useCategories = (endpoint) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `jwt ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch categories');

      const data = await res.json();
      setCategories(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Add category
  const addCategory = useCallback(
    async (name, color) => {
      try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `jwt ${token}`,
          },
          body: JSON.stringify({ name, color }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to add category');
        }

        const data = await res.json();
        setCategories((prev) => [...prev, data.category]);
        return data.category;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [endpoint]
  );

  // Update category
  const updateCategory = useCallback(
    async (id, updates) => {
      try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `jwt ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update category');
        }

        const data = await res.json();
        setCategories((prev) =>
          prev.map((cat) => (cat._id === id ? data.category : cat))
        );
        return data.category;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [endpoint]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (id) => {
      try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `jwt ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete category');
        }

        setCategories((prev) => prev.filter((cat) => cat._id !== id));
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [endpoint]
  );

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
