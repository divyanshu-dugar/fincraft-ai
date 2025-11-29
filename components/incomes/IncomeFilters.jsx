"use client";

import { Calendar, Filter, Tag } from "lucide-react";

export default function IncomeFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  dateRange,
  setDateRange,
}) {
  return (
    <div className="relative bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm rounded-2xl p-6 mb-10 transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
          <Filter className="inline-block w-5 h-5 mr-2 text-green-500" />
          Income Filters
        </h2>

        <button
          onClick={() =>
            setDateRange({ startDate: "", endDate: "" }) ||
            setSelectedCategory("all")
          }
          className="text-sm text-gray-500 hover:text-green-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 🏷 Category Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-emerald-500" />
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 text-gray-800 border border-gray-300 rounded-xl bg-white/80 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-200"
          >
            <option value="all">All Categories</option>
            {categories?.map((category) => (
              <option key={category._id || category.name} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 📅 Start Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-green-500" />
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white/80 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        {/* 📆 End Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-teal-500" />
            End Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white/80 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Subtle background gradient accent */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-r from-green-300/20 to-emerald-300/20 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}