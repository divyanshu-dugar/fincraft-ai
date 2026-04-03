"use client";

import { useState } from "react";
import { CreditCard, DollarSign, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const BAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-sky-500",
];
const INCOME_BAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-green-500",
  "bg-lime-500",
  "bg-emerald-400",
];

export function CategoryBreakdown({ dashboardData, formatCurrency, getCategoryIcon }) {
  const [view, setView] = useState("expenses");
  const router = useRouter();

  const expenseCategories = dashboardData?.categories?.expenses || [];
  const incomeCategories = dashboardData?.categories?.income || [];
  const total =
    view === "expenses"
      ? dashboardData?.overview?.totalExpenses || 0
      : dashboardData?.overview?.totalIncome || 0;
  const categories = view === "expenses" ? expenseCategories : incomeCategories;
  const colors = view === "expenses" ? BAR_COLORS : INCOME_BAR_COLORS;
  const analyticsRoute = view === "expenses" ? "/expense/analytics" : "/income/analytics";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Category Breakdown</h2>
          <p className="text-gray-500 text-sm">Top categories this period</p>
        </div>
        <button
          onClick={() => router.push(analyticsRoute)}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-100 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink size={13} />
          View Analytics
        </button>
      </div>

      {/* Toggle: Expenses / Income */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setView("expenses")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "expenses"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <CreditCard size={14} />
          Expenses
        </button>
        <button
          onClick={() => setView("income")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "income"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <DollarSign size={14} />
          Income
        </button>
      </div>

      {/* Category list with bar */}
      <div className="space-y-4">
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.name);
          const pct = total > 0 ? (category.totalAmount / total) * 100 : 0;
          const barColor = colors[index % colors.length];
          const iconBg = view === "expenses" ? "bg-blue-50" : "bg-emerald-50";
          const iconColor = view === "expenses" ? "text-blue-600" : "text-emerald-600";

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${iconBg}`}>
                    <Icon size={15} className={iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-400">{category.count || 1} transaction(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(category.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400">{pct.toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            {view === "expenses" ? (
              <CreditCard className="w-6 h-6 text-gray-400" />
            ) : (
              <DollarSign className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <p className="text-gray-400 text-sm">No {view} data this period</p>
        </div>
      )}
    </div>
  );
}

