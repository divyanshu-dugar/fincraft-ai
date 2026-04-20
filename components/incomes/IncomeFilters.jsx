"use client";

import { Calendar, Filter, Tag, Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function IncomeFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  dateRange,
  setDateRange,
  onCustomRangeApply,
  onCustomRangeReset,
}) {
  const [search, setSearch] = useState("");
  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);
  return (
    <div className="relative bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 mb-10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          <Filter className="inline-block w-5 h-5 mr-2 text-cyan-400" />
          Income Filters
        </h2>

        <button
          onClick={() => {
            setSelectedCategory("all");
            onCustomRangeReset?.();
          }}
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-400 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 🏷 Category Filter with Search */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-emerald-400" />
            Category
          </label>
          <div className="relative mb-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 border border-slate-600 rounded-xl bg-slate-200/50 dark:bg-slate-700/50 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-200 w-full"
            />
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 text-slate-800 dark:text-slate-200 border border-slate-600 rounded-xl bg-slate-200/50 dark:bg-slate-700/50 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-200"
          >
            <option value="all">All Categories</option>
            {filteredCategories?.map((category) => (
              <option key={category._id || category.name} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 📅 Start Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => {
              setDateRange({ ...dateRange, startDate: e.target.value });
              onCustomRangeApply?.();
            }}
            className="px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-200/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 [color-scheme:dark] focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        {/* 📆 End Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-teal-400" />
            End Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => {
              setDateRange({ ...dateRange, endDate: e.target.value });
              onCustomRangeApply?.();
            }}
            className="px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-200/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 [color-scheme:dark] focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Subtle background gradient accent */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}