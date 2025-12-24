"use client";

/**
 * @file ExpenseTable.jsx
 * @description
 * Presentational component responsible for rendering expenses in a
 * grouped, animated, and interactive table format.
 *
 * Expenses are grouped by date, with each day displaying:
 * - A sticky header containing the date and daily total
 * - A detailed table of individual expenses
 *
 * This component is UI-focused and receives all data, navigation,
 * formatting utilities, and actions via props.
 *
 * @author Divyanshu Dugar
 * @project FinCraft AI
 */

import { Pencil, Trash2, TrendingUp, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ExpenseTable Component
 *
 * @param {Object} props
 * @param {Array} props.expenses - List of expense objects to display
 * @param {Object} props.router - Next.js router instance for navigation
 * @param {Function} props.deleteExpense - Callback to delete an expense
 * @param {Function} props.formatCurrency - Utility to format currency values
 * @param {Function} props.formatDate - Utility to format dates (used for grouping)
 */
export default function ExpenseTable({
  expenses = [],
  router,
  deleteExpense,
  formatCurrency = (v) => `$${v.toFixed(2)}`,
  formatDate,
}) {
  /* ============================================================
     Utility Helpers
     ============================================================ */

  /**
   * Calculates total expense amount for a single day
   * @param {Array} expenses - List of expenses for a given date
   * @returns {number} Daily total amount
   */
  const calculateDailyTotal = (expenses) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  /**
   * Returns a subtle background gradient based on row index
   * Used to visually differentiate rows
   */
  const getRowBackgroundColor = (index) => {
    const colors = [
      "from-white to-gray-50/80",
      "from-blue-50/30 to-indigo-50/20",
      "from-emerald-50/20 to-cyan-50/10",
      "from-violet-50/15 to-purple-50/10",
    ];
    return colors[index % colors.length];
  };

  /**
   * Returns a hover gradient based on row index
   * Enhances interaction feedback
   */
  const getHoverGradient = (index) => {
    const gradients = [
      "hover:from-blue-50/40 hover:to-indigo-50/30",
      "hover:from-emerald-50/30 hover:to-teal-50/20",
      "hover:from-violet-50/25 hover:to-purple-50/15",
      "hover:from-amber-50/20 hover:to-orange-50/10",
    ];
    return gradients[index % gradients.length];
  };

  /* ============================================================
     Empty State
     ============================================================ */

  // Render a friendly empty state if no expenses exist
  if (!expenses || expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl text-center py-20 border border-gray-200/60"
      >
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            No expenses yet
          </h3>

          <p className="text-gray-500 text-lg mb-8">
            Start tracking your spending journey by adding your first expense.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/expense/add")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add Your First Expense
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ============================================================
     Data Grouping
     ============================================================ */

  /**
   * Group expenses by formatted date
   * Structure:
   * {
   *   "Jan 01, 2025": [expense, expense],
   *   "Jan 02, 2025": [expense]
   * }
   */
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const dateKey = formatDate(expense.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);
    return acc;
  }, {});

  // Sort dates in descending order (latest first)
  const sortedDates = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  /* ============================================================
     Main Table Rendering
     ============================================================ */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <AnimatePresence>
          {sortedDates.map((date, dateIndex) => {
            const dailyExpenses = groupedExpenses[date];
            const dailyTotal = calculateDailyTotal(dailyExpenses);

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
                className="border-b border-gray-100/80 last:border-b-0"
              >
                {/* ====================================================
                    Sticky Daily Header
                   ==================================================== */}
                <div className="backdrop-blur-lg bg-gradient-to-r from-gray-50 to-blue-50/30 px-8 py-6 sticky top-0 z-20 border-b border-gray-200/60 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{date}</h2>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Daily Total
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(dailyTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ====================================================
                    Expenses Table
                   ==================================================== */}
                <div className="px-2 py-4">
                  <table className="w-full">
                    <colgroup>
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "22%" }} />
                      <col style={{ width: "35%" }} />
                      <col style={{ width: "15%" }} />
                    </colgroup>

                    <thead>
                      <tr className="border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-gray-100/50">
                        {["Category", "Amount", "Note", "Actions"].map(
                          (header, index) => (
                            <th
                              key={header}
                              className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider"
                            >
                              <div className="flex items-center gap-2">
                                {header}
                                {header === "Amount" && (
                                  <TrendingUp
                                    size={14}
                                    className="text-gray-400"
                                  />
                                )}
                              </div>
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      <AnimatePresence>
                        {dailyExpenses.map((expense, expenseIndex) => {
                          const category = expense.category || {};
                          const categoryName = category.name || "Uncategorized";
                          const categoryColor = category.color || "#9ca3af";
                          const rowBgColor =
                            getRowBackgroundColor(expenseIndex);
                          const hoverGradient = getHoverGradient(expenseIndex);

                          return (
                            <motion.tr
                              key={expense._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: dateIndex * 0.1 + expenseIndex * 0.05,
                              }}
                              className={`group bg-gradient-to-r ${rowBgColor} ${hoverGradient} transition-all duration-300 border-b border-gray-100/30 last:border-b-0`}
                            >
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

                              {/* Amount */}
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                                    {formatCurrency(expense.amount)}
                                  </span>
                                  {expense.note && (
                                    <span className="text-xs text-gray-400 mt-1 group-hover:text-gray-500 transition-colors">
                                      {new Date(
                                        expense.date
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Note */}
                              <td className="px-6 py-5">
                                <div className="max-w-xs">
                                  {expense.note ? (
                                    <motion.p
                                      className="text-gray-700 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-900 transition-colors"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      {expense.note}
                                    </motion.p>
                                  ) : (
                                    <span className="text-gray-400 text-sm italic group-hover:text-gray-500 transition-colors">
                                      — No note —
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Enhanced Actions */}
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1, y: -1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      router.push(
                                        `/expense/edit/${expense._id}`
                                      )
                                    }
                                    className="p-2.5 bg-white text-blue-600 rounded-xl border border-blue-200/60 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md group/btn"
                                  >
                                    <Pencil size={18} />
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                      Edit
                                    </span>
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.1, y: -1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteExpense(expense._id)}
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-8 py-6 border-t border-gray-200/60"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total <span className="font-semibold">{expenses.length}</span>{" "}
            expenses across{" "}
            <span className="font-semibold">{sortedDates.length}</span> days
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/expense/add")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Expense
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
