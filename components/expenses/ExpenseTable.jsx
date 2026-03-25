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
   * Safely formats a time for display
   */
  const formatExpenseTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    const dateKey = new Date(expense.date).toISOString().split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        label: formatDate(expense.date),
        items: [],
      };
    }

    acc[dateKey].items.push(expense);
    return acc;
  }, {});

  // Sort dates in descending order (latest first)
  const sortedDateKeys = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  /* ============================================================
     Main Table Rendering
     ============================================================ */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-200/70 overflow-hidden"
    >
      <div>
        <AnimatePresence>
          {sortedDateKeys.map((dateKey, dateIndex) => {
            const group = groupedExpenses[dateKey];
            const dailyExpenses = group.items;
            const dailyTotal = calculateDailyTotal(dailyExpenses);

            return (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
                className="border-b border-gray-100/80 last:border-b-0"
              >
                {/* ====================================================
                    Sticky Daily Header
                   ==================================================== */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-5 md:px-8 py-5 border-b border-slate-700/70">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.25),transparent_40%)]" />
                  <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl md:text-2xl font-bold text-white">
                        {group.label}
                      </h2>
                      <span className="inline-flex items-center rounded-full bg-white/15 text-blue-50 text-xs font-semibold px-2.5 py-1 border border-white/25 backdrop-blur-sm">
                        {dailyExpenses.length} item{dailyExpenses.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-right px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                      <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-[0.18em]">
                        Daily Total
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-white mt-0.5">
                        {formatCurrency(dailyTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ====================================================
                    Expenses Table
                   ==================================================== */}
                <div className="hidden md:block px-4 md:px-6 py-4 overflow-x-auto bg-slate-50/70 border-y border-slate-100">
                  <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0">
                    <colgroup>
                      <col className="w-[30%]" />
                      <col className="w-[20%]" />
                      <col className="w-[35%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 via-blue-50 to-cyan-50 text-left">
                        {["Category", "Amount", "Note", "Actions"].map((header) => (
                          <th
                            key={header}
                            className="px-4 lg:px-6 py-3.5 text-sm font-bold uppercase text-slate-700 tracking-[0.14em] border-b-2 border-slate-200"
                          >
                            <div className="flex items-center gap-2">
                              {header}
                              {header === "Amount" && (
                                <TrendingUp size={15} className="text-blue-600" />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      <AnimatePresence>
                        {dailyExpenses.map((expense, expenseIndex) => {
                          const category = expense.category || {};
                          const categoryName = category.name || "Uncategorized";
                          const categoryColor = category.color || "#9ca3af";

                          return (
                            <motion.tr
                              key={expense._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: dateIndex * 0.1 + expenseIndex * 0.05,
                              }}
                              className="group border-b border-slate-200/70 last:border-b-0 odd:bg-white/95 even:bg-slate-100/70 hover:bg-blue-100/45 transition-colors"
                            >
                              <td className="px-4 lg:px-6 py-4">
                                <span className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: categoryColor }}
                                  />
                                  <span className="truncate">{categoryName}</span>
                                </span>
                              </td>

                              <td className="px-4 lg:px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-base font-semibold text-gray-900">
                                    {formatCurrency(expense.amount)}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-0.5">
                                    {formatExpenseTime(expense.date)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 lg:px-6 py-4">
                                {expense.note ? (
                                  <p
                                    className="text-sm text-gray-700 leading-relaxed line-clamp-2 break-words"
                                    title={expense.note}
                                  >
                                    {expense.note}
                                  </p>
                                ) : (
                                  <span className="text-sm italic text-gray-400">
                                    No note added
                                  </span>
                                )}
                              </td>

                              <td className="px-4 lg:px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.06, y: -1 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() =>
                                      router.push(`/expense/edit/${expense._id}`)
                                    }
                                    className="relative p-2 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm group/btn"
                                    aria-label="Edit expense"
                                  >
                                    <Pencil size={16} />
                                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                      Edit
                                    </span>
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.06, y: -1 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => deleteExpense(expense._id)}
                                    className="relative p-2 bg-white text-red-600 rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 shadow-sm group/btn"
                                    aria-label="Delete expense"
                                  >
                                    <Trash2 size={16} />
                                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
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

                <div className="md:hidden px-4 pb-4 pt-3 space-y-3 bg-slate-50/60 border-y border-slate-100">
                  <AnimatePresence>
                    {dailyExpenses.map((expense, expenseIndex) => {
                      const category = expense.category || {};
                      const categoryName = category.name || "Uncategorized";
                      const categoryColor = category.color || "#9ca3af";

                      return (
                        <motion.div
                          key={expense._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: dateIndex * 0.1 + expenseIndex * 0.05,
                          }}
                          className="bg-white/95 rounded-xl border border-slate-200 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: categoryColor }}
                              />
                              {categoryName}
                            </span>
                            <div className="text-right">
                              <div className="text-base font-semibold text-gray-900">
                                {formatCurrency(expense.amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatExpenseTime(expense.date)}
                              </div>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                            {expense.note || "No note added"}
                          </p>

                          <div className="mt-4 flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() =>
                                router.push(`/expense/edit/${expense._id}`)
                              }
                              className="px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => deleteExpense(expense._id)}
                              className="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 rounded-lg border border-red-200"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
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
        className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-5 md:px-8 py-5 border-t border-gray-200/60"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Total <span className="font-semibold">{expenses.length}</span>{" "}
            expenses across{" "}
            <span className="font-semibold">{sortedDateKeys.length}</span> days
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/expense/add")}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Expense
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
