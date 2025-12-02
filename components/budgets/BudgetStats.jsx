"use client";

import { TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function BudgetStats({ stats, formatCurrency }) {
  if (!stats) return null;

  // Filter active budgets (current date within budget period)
  const today = new Date();
  const activeBudgets =
    stats.budgetStats?.filter((budget) => {
      if (!budget.isActive) return false;

      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      return today >= startDate && today <= endDate;
    }) || [];

  // Calculate stats based on active budgets only
  const totalBudget = activeBudgets.reduce(
    (sum, budget) => sum + (budget.amount || 0),
    0
  );
  const totalSpent = activeBudgets.reduce(
    (sum, budget) => sum + (budget.currentSpent || 0),
    0
  );
  const totalRemaining = Math.max(totalBudget - totalSpent, 0);
  const overallPercentage =
    totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // Count exceeded budgets (over 100% spent)
  const exceededBudgets = activeBudgets.filter((budget) => {
    const currentSpent = budget.currentSpent || 0;
    const amount = budget.amount || 0;
    return amount > 0 && currentSpent / amount > 1; // Changed from >= 1 to > 1
  }).length;

  // Count limit reached budgets (exactly 100% spent)
  const limitReachedBudgets = activeBudgets.filter((budget) => {
    const currentSpent = budget.currentSpent || 0;
    const amount = budget.amount || 0;
    return amount > 0 && currentSpent / amount === 1;
  }).length;

  // Count almost exceeded budgets (80-99% spent)
  const almostExceededBudgets = activeBudgets.filter((budget) => {
    const currentSpent = budget.currentSpent || 0;
    const amount = budget.amount || 0;
    const percentage = amount > 0 ? (currentSpent / amount) * 100 : 0;
    return percentage >= 80 && percentage < 100; // Changed from >= 80 && percentage < 100
  }).length;

  const statCards = [
    {
      label: "Active Budgets",
      value: activeBudgets.length,
      icon: Target,
      color: "purple",
      description: "Currently active budgets",
      showAlert: false,
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      icon: TrendingUp,
      color: "blue",
      description: "Across active budgets",
      showAlert: false,
    },
    {
      label: "Total Remaining",
      value: formatCurrency(totalRemaining),
      icon: CheckCircle,
      color: "green",
      description: "Available to spend",
      showAlert: false,
    },
    {
      label: "Exceeded Budgets",
      value: exceededBudgets,
      icon: AlertTriangle,
      color: "red",
      description: "Need attention",
      showAlert: exceededBudgets > 0,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 mb-8"
    >
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              {stat.showAlert && (
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-700`}
                >
                  Alert
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      {activeBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  overallPercentage >= 100
                    ? "bg-red-100"
                    : overallPercentage >= 80
                    ? "bg-orange-100"
                    : "bg-green-100"
                }`}
              >
                <TrendingUp
                  className={`w-6 h-6 ${
                    overallPercentage >= 100
                      ? "text-red-600"
                      : overallPercentage >= 80
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Overall Budget Usage
                </h3>
                <p className="text-sm text-gray-500">
                  Across all active budgets
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {overallPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Spending Progress</span>
              <span
                className={`font-semibold ${
                  overallPercentage >= 100
                    ? "text-red-600"
                    : overallPercentage >= 80
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {overallPercentage >= 100
                  ? "Exceeded"
                  : overallPercentage >= 80
                  ? "Almost Exceeded"
                  : "On Track"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  overallPercentage >= 100
                    ? "bg-red-500"
                    : overallPercentage >= 80
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>

            {/* Threshold Markers */}
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0%</span>
              <span>Budget Limit</span>
              <span>100%</span>
            </div>
          </div>
          {/* Budget Status Summary */}
          <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="font-semibold text-green-700">
                {activeBudgets.length -
                  exceededBudgets -
                  almostExceededBudgets -
                  limitReachedBudgets}
              </div>
              <div className="text-green-600">On Track</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="font-semibold text-blue-700">
                {limitReachedBudgets}
              </div>
              <div className="text-blue-600">Limit Reached</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-200">
              <div className="font-semibold text-orange-700">
                {almostExceededBudgets}
              </div>
              <div className="text-orange-600">Almost Exceeded</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="font-semibold text-red-700">
                {exceededBudgets}
              </div>
              <div className="text-red-600">Exceeded</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
