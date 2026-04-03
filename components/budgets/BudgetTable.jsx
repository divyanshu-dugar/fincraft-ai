"use client";

import {
  Pencil,
  Trash2,
  TrendingUp,
  Plus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BudgetTable({
  budgets = [],
  router,
  deleteBudget,
  formatCurrency = (v) => `$${v.toFixed(2)}`,
  formatDate,
}) {
  // Generate subtle background colors based on index
  const getRowBackgroundColor = (index) => {
    const colors = [
      "from-slate-800/90 to-slate-800/70",
      "from-slate-800/80 to-indigo-900/20",
      "from-slate-800/80 to-blue-900/10",
      "from-slate-800/80 to-violet-900/10",
    ];
    return colors[index % colors.length];
  };

  // Helper function to determine date status
  const getDateStatus = (budget) => {
    const today = new Date();
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);

    if (today < startDate) {
      return {
        label: "Upcoming",
        color: "blue",
        textColor: "text-blue-400",
        bgColor: "bg-blue-500/15",
        borderColor: "border-blue-500/30",
      };
    } else if (today > endDate) {
      return {
        label: "Expired",
        color: "gray",
        textColor: "text-slate-400",
        bgColor: "bg-slate-700/50",
        borderColor: "border-slate-600/30",
      };
    } else {
      return {
        label: "Current",
        color: "green",
        textColor: "text-emerald-400",
        bgColor: "bg-emerald-500/15",
        borderColor: "border-emerald-500/30",
      };
    }
  };

  // Get hover gradient based on index
  const getHoverGradient = (index) => {
    const gradients = [
      "hover:from-slate-700/40 hover:to-slate-700/30",
      "hover:from-slate-700/30 hover:to-slate-700/20",
      "hover:from-slate-700/25 hover:to-slate-700/15",
      "hover:from-slate-700/20 hover:to-slate-700/10",
    ];
    return gradients[index % gradients.length];
  };

  // Safe calculation functions
  const getCurrentSpent = (budget) => {
    return budget.currentSpent || 0;
  };

  const getBudgetPercentage = (budget) => {
    const currentSpent = getCurrentSpent(budget);
    const amount = budget.amount || 0;
    if (amount === 0) return 0;
    return Math.min((currentSpent / amount) * 100, 100);
  };

  const getRemainingAmount = (budget) => {
    const currentSpent = getCurrentSpent(budget);
    const amount = budget.amount || 0;
    return Math.max(amount - currentSpent, 0);
  };

  // Get status color and icon
  // Get status color and icon
const getBudgetStatus = (budget) => {
  const percentage = getBudgetPercentage(budget);
  
  if (percentage > 100) { // Changed from >= 100 to > 100
    return {
      color: "red",
      icon: AlertTriangle,
      label: "Exceeded",
      textColor: "text-red-400",
      bgColor: "bg-red-500/15",
      borderColor: "border-red-500/30",
    };
  } else if (percentage === 100) { // New: exactly at 100%
    return {
      color: "blue",
      icon: CheckCircle,
      label: "Limit Reached",
      textColor: "text-blue-400",
      bgColor: "bg-blue-500/15",
      borderColor: "border-blue-500/30",
    };
  } else if (percentage >= 80) {
    return {
      color: "orange",
      icon: AlertTriangle,
      label: "Almost Exceeded",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/15",
      borderColor: "border-amber-500/30",
    };
  } else {
    return {
      color: "green",
      icon: CheckCircle,
      label: "On Track",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/30",
    };
  }
};

  // Case: No budgets
  if (!budgets || budgets.length === 0) {
    return null; // Handled by empty state in parent
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/60 rounded-3xl border border-cyan-400/20 overflow-hidden mb-8"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-700/60 bg-gradient-to-r from-slate-800/80 to-slate-800/50">
              {[
                "Budget Name",
                "Category",
                "Progress",
                "Amount",
                "Period",
                "Actions",
              ].map((header, index) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-400 tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    {header}
                    {header === "Progress" && (
                      <TrendingUp size={14} className="text-slate-500" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {budgets.map((budget, index) => {
                const category = budget.category || {};
                const categoryName = category.name || "Uncategorized";
                const categoryColor = category.color || "#8b5cf6";
                const rowBgColor = getRowBackgroundColor(index);
                const hoverGradient = getHoverGradient(index);
                const status = getBudgetStatus(budget);
                const StatusIcon = status.icon;
                const currentSpent = getCurrentSpent(budget);
                const percentage = getBudgetPercentage(budget);
                const remaining = getRemainingAmount(budget);
                const dateStatus = getDateStatus(budget);

                return (
                  <motion.tr
                    key={budget._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group bg-gradient-to-r ${rowBgColor} ${hoverGradient} transition-all duration-300 border-b border-slate-700/30 last:border-b-0`}
                  >
                    {/* Budget Name */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {budget.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} ${status.borderColor} border`}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          {dateStatus.label !== "Current" && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${dateStatus.bgColor} ${dateStatus.textColor} ${dateStatus.borderColor} border`}
                            >
                              {dateStatus.label}
                            </span>
                          )}
                          {!budget.isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-5">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-lg transition-all duration-200 group-hover:shadow-xl"
                        style={{
                          backgroundColor: categoryColor,
                          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        {categoryName}
                      </motion.span>
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Spent</span>
                          <span className="font-medium text-slate-200">
                            {formatCurrency(currentSpent)} /{" "}
                            {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              percentage >= 100
                                ? "bg-red-500"
                                : percentage >= 80
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{percentage.toFixed(1)}% used</span>
                          <span>{formatCurrency(remaining)} left</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white group-hover:text-slate-100 transition-colors">
                          {formatCurrency(budget.amount)}
                        </span>
                        <span className="text-sm text-slate-400 capitalize">
                          {budget.period}
                        </span>
                      </div>
                    </td>

                    {/* Period */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-sm text-slate-400">
                        <span className="font-medium text-slate-300">
                          {formatDate(budget.startDate)}
                        </span>
                        <span className="text-slate-500">to</span>
                        <span className="font-medium text-slate-300">
                          {formatDate(budget.endDate)}
                        </span>
                      </div>
                    </td>

                    {/* Enhanced Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            router.push(`/budget/edit/${budget._id}`)
                          }
                          className="p-2.5 bg-slate-700/50 text-purple-400 rounded-xl border border-purple-500/30 hover:bg-purple-500/15 hover:border-purple-400/50 transition-all duration-200 group/btn"
                        >
                          <Pencil size={18} />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                            Edit
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1, y: -1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteBudget(budget._id)}
                          className="p-2.5 bg-slate-700/50 text-rose-400 rounded-xl border border-rose-500/30 hover:bg-rose-500/15 hover:border-rose-400/50 transition-all duration-200 group/btn"
                        >
                          <Trash2 size={18} />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                            Delete
                          </span>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/80 px-8 py-6 border-t border-slate-700/60"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing <span className="font-semibold text-slate-200">{budgets.length}</span>{" "}
            budgets
            {budgets.some((b) => !b.isActive) && (
              <span className="ml-2 text-amber-400">
                ({budgets.filter((b) => !b.isActive).length} inactive)
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/budget/add")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            New Budget
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}