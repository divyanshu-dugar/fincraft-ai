"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { getToken } from '@/lib/authenticate';

export default function AddIncomeCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#10B981");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
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
        toast.error("Failed to load existing categories");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    // Check for duplicate category name
    const existingName = categories.find(
      cat => cat.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingName) {
      toast.error("Category name already exists. Please choose a different name.");
      return;
    }

    // Check for similar colors
    const similarColor = categories.find(
      cat => cat.color.toLowerCase() === color.toLowerCase()
    );
    if (similarColor) {
      toast.error(`This color is already used for "${similarColor.name}". Please choose a different color.`);
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), color }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Income category added successfully!");
        router.push("/income/list");
      } else {
        toast.error(data?.message || "Failed to add category.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getColorBrightness = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50/30 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Income Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Organize your income streams with custom categories. Choose unique colors to easily identify your earnings sources.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Category Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Add New Income Category
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Salary, Freelance, Investments, Bonus..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium px-3 py-1 rounded-full border"
                      style={{ 
                        backgroundColor: color,
                        color: getColorBrightness(color) > 128 ? '#000' : '#fff',
                        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`
                      }}
                    >
                      Preview
                    </span>
                    <span className="text-sm text-gray-600 font-mono">
                      {color.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Choose a unique color that&apos;s not already used by other categories
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl py-3 px-4 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Category...
                  </div>
                ) : (
                  "Add Income Category"
                )}
              </button>
            </form>
          </motion.div>

          {/* Existing Categories */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Existing Categories
              </h2>
              <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                {categories.length} categories
              </span>
            </div>

            {fetchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  Loading categories...
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No income categories yet</p>
                <p className="text-sm text-gray-400">Create your first income category to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {categories.map((category, index) => (
                    <motion.div
                      key={category._id || category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-800">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-mono px-2 py-1 rounded-md border"
                          style={{ 
                            backgroundColor: `${category.color}15`,
                            color: category.color,
                            borderColor: `${category.color}30`
                          }}
                        >
                          {category.color.toUpperCase()}
                        </span>
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-white shadow-sm"
                          style={{ backgroundColor: category.color }}
                          title={`Color: ${category.color}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Color Usage Tips */}
            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
              <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Color Selection Tips
              </h3>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Choose distinct colors for better visual separation</li>
                <li>• Consider color blindness when selecting similar hues</li>
                <li>• Use darker colors for better text readability</li>
                <li>• Green tones work well for income-related categories</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}