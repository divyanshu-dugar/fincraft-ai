"use client";

import { Filter } from "lucide-react";

export default function BudgetFilters({ filter, setFilter, budgetsCount }) {
  const filters = [
    { value: "all", label: "All Budgets", color: "gray" },
    { value: "active", label: "Active", color: "green" },
    { value: "almost_exceeded", label: "Almost Exceeded", color: "orange" },
    { value: "exceeded", label: "Exceeded", color: "red" },
  ];

  return (
    <div className="relative bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm rounded-2xl p-6 mb-10 transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
          <Filter className="inline-block w-5 h-5 mr-2 text-purple-500" />
          Budget Filters
        </h2>

        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{budgetsCount}</span> budgets
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {filters.map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
              filter === filterOption.value
                ? `bg-${filterOption.color}-100 text-${filterOption.color}-700 border-${filterOption.color}-300 shadow-sm`
                : "bg-white/80 text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Subtle background gradient accent */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}