"use client";

import { Filter, Calendar, TrendingUp, ChartLine } from "lucide-react";

export default function BudgetFilters({ filter, setFilter, budgetsCount }) {
  const filters = [
    { value: "active", label: "Active", color: "green", icon: Calendar },
    { value: "almost_exceeded", label: "Almost Exceeded", color: "orange", icon: TrendingUp },
    { value: "limit_reached", label: "Limit Reached", color: "orange", icon: ChartLine },
    { value: "exceeded", label: "Exceeded", color: "red", icon: TrendingUp },
    { value: "all", label: "All Budgets", color: "gray", icon: null },
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
        {filters.map((filterOption) => {
          const Icon = filterOption.icon;
          return (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 border flex items-center gap-2 ${
                filter === filterOption.value
                  ? `bg-${filterOption.color}-100 text-${filterOption.color}-700 border-${filterOption.color}-300 shadow-sm`
                  : "bg-white/80 text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {Icon && <Icon size={16} />}
              {filterOption.label}
            </button>
          );
        })}
      </div>

      {/* Filter Descriptions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <span>All: All budgets created</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-300"></div>
          <span>Active: Current month/year budgets</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-300"></div>
          <span>Almost: 80-99% used</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-300"></div>
          <span>Exceeded: 100% or more used</span>
        </div>
      </div>

      {/* Subtle background gradient accent */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}