"use client";

import { Pencil, Trash2, TrendingUp, Plus, AlertTriangle, CheckCircle } from "lucide-react";
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
      'from-white to-gray-50/80',
      'from-purple-50/30 to-indigo-50/20',
      'from-blue-50/20 to-cyan-50/10',
      'from-violet-50/15 to-purple-50/10',
    ];
    return colors[index % colors.length];
  };

  // Get hover gradient based on index
  const getHoverGradient = (index) => {
    const gradients = [
      'hover:from-purple-50/40 hover:to-indigo-50/30',
      'hover:from-blue-50/30 hover:to-cyan-50/20',
      'hover:from-violet-50/25 hover:to-purple-50/15',
      'hover:from-indigo-50/20 hover:to-blue-50/10',
    ];
    return gradients[index % gradients.length];
  };

  // Get status color and icon
  const getBudgetStatus = (budget) => {
    const percentage = (budget.currentSpent / budget.amount) * 100;
    
    if (percentage >= 100) {
      return {
        color: 'red',
        icon: AlertTriangle,
        label: 'Exceeded',
        textColor: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200'
      };
    } else if (percentage >= 80) {
      return {
        color: 'orange',
        icon: AlertTriangle,
        label: 'Almost Exceeded',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200'
      };
    } else {
      return {
        color: 'green',
        icon: CheckCircle,
        label: 'On Track',
        textColor: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
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
      className="bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden mb-8"
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
            <tr className="border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-gray-100/50">
              {["Budget Name", "Category", "Progress", "Amount", "Period", "Actions"].map((header, index) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    {header}
                    {header === "Progress" && (
                      <TrendingUp size={14} className="text-gray-400" />
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
                const percentage = Math.min((budget.currentSpent / budget.amount) * 100, 100);
                const remaining = Math.max(budget.amount - budget.currentSpent, 0);

                return (
                  <motion.tr
                    key={budget._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group bg-gradient-to-r ${rowBgColor} ${hoverGradient} transition-all duration-300 border-b border-gray-100/30 last:border-b-0`}
                  >
                    {/* Budget Name */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                          {budget.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} ${status.borderColor} border`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          {!budget.isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
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
                          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`
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
                          <span className="text-gray-600">Spent</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(budget.currentSpent)} / {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              percentage >= 100 
                                ? 'bg-red-500' 
                                : percentage >= 80 
                                ? 'bg-orange-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{percentage.toFixed(1)}% used</span>
                          <span>{formatCurrency(remaining)} left</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                          {formatCurrency(budget.amount)}
                        </span>
                        <span className="text-sm text-gray-500 capitalize">
                          {budget.period}
                        </span>
                      </div>
                    </td>

                    {/* Period */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-sm text-gray-600">
                        <span className="font-medium">{formatDate(budget.startDate)}</span>
                        <span className="text-gray-400">to</span>
                        <span className="font-medium">{formatDate(budget.endDate)}</span>
                      </div>
                    </td>

                    {/* Enhanced Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => router.push(`/budget/edit/${budget._id}`)}
                          className="p-2.5 bg-white text-purple-600 rounded-xl border border-purple-200/60 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 shadow-sm hover:shadow-md group/btn"
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
                          className="p-2.5 bg-white text-red-600 rounded-xl border border-red-200/60 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md group/btn"
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
        className="bg-gradient-to-r from-gray-50 to-purple-50/30 px-8 py-6 border-t border-gray-200/60"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{budgets.length}</span> budgets
            {budgets.some(b => !b.isActive) && (
              <span className="ml-2 text-orange-600">
                ({budgets.filter(b => !b.isActive).length} inactive)
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