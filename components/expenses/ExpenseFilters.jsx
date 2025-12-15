"use client";

/**
 * @file ExpenseFilters.jsx
 * @description
 * Presentational component responsible for rendering and managing
 * expense filtering controls such as category selection and date range.
 *
 * This component is fully controlled by its parent via props and
 * does not maintain any internal state. All user interactions
 * propagate changes upward through setter functions.
 *
 * The component focuses purely on UI and interaction handling,
 * keeping logic outside for better separation of concerns.
 *
 * @author Divyanshu Dugar
 * @project FinCraft AI
 */

import { Calendar, Filter, Tag } from "lucide-react";

/**
 * ExpenseFilters Component
 *
 * @param {Object} props
 * @param {Array} props.categories - List of available expense categories
 * @param {string} props.selectedCategory - Currently selected category ID
 * @param {Function} props.setSelectedCategory - Setter for selected category
 * @param {Object} props.dateRange - Selected date range for filtering
 * @param {string} props.dateRange.startDate - Start date (YYYY-MM-DD)
 * @param {string} props.dateRange.endDate - End date (YYYY-MM-DD)
 * @param {Function} props.setDateRange - Setter for date range
 */
export default function ExpenseFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  dateRange,
  setDateRange,
}) {
  return (
    <div className="relative bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm rounded-2xl p-6 mb-10 transition-all duration-300 hover:shadow-md">
      {/* ============================================================
          Header Section - Displays title and reset action
         ============================================================ */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Filter className="inline-block w-5 h-5 mr-2 text-blue-500" />
          Expense Filters
        </h2>

        {/* Resets category and date range filters to default values */}
        <button
          onClick={() =>
            setDateRange({ startDate: "", endDate: "" }) ||
            setSelectedCategory("all")
          }
          className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* ============================================================
          Filters Grid
          - Responsive layout for all filter controls
         ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ========================================================
            Category Filter
            - Allows filtering expenses by category
           ======================================================== */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-purple-500" />
            Category
          </label>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 text-gray-800 border border-gray-300 rounded-xl bg-white/80 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200"
          >
            {/* Default option for unfiltered view */}
            <option value="all">All Categories</option>

            {/* Dynamically render category options */}
            {categories?.map((category) => (
              <option key={category._id || category.name} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* ========================================================
            Start Date Filter
            - Filters expenses starting from selected date
           ======================================================== */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            Start Date
          </label>

          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        {/* ========================================================
            End Date Filter
            - Filters expenses up to selected date
           ======================================================== */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-pink-500" />
            End Date
          </label>

          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white/80 focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
      </div>

    </div>
  );
}
