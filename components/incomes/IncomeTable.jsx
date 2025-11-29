"use client";

import { Pencil, Trash2, TrendingUp, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IncomeTable({
  incomes = [],
  router,
  deleteIncome,
  formatCurrency = (v) => `$${v.toFixed(2)}`,
  formatDate,
}) {
  // Calculate daily totals
  const calculateDailyTotal = (incomes) => {
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  };

  // Generate subtle background colors based on index
  const getRowBackgroundColor = (index) => {
    const colors = [
      'from-white to-gray-50/80', // Pure white with subtle gray
      'from-green-50/30 to-emerald-50/20', // Very subtle green
      'from-teal-50/20 to-cyan-50/10', // Very subtle teal
      'from-lime-50/15 to-green-50/10', // Very subtle lime
    ];
    return colors[index % colors.length];
  };

  // Get hover gradient based on index
  const getHoverGradient = (index) => {
    const gradients = [
      'hover:from-green-50/40 hover:to-emerald-50/30', // Green hover
      'hover:from-teal-50/30 hover:to-cyan-50/20', // Teal hover
      'hover:from-lime-50/25 hover:to-green-50/15', // Lime hover
      'hover:from-emerald-50/20 hover:to-teal-50/10', // Emerald hover
    ];
    return gradients[index % gradients.length];
  };

  // Case: No incomes
  if (!incomes || incomes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl text-center py-20 border border-gray-200/60"
      >
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            No income yet
          </h3>
          <p className="text-gray-500 text-lg mb-8">
            Start tracking your earnings journey by adding your first income record.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/income/add")}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add Your First Income
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Group incomes by date
  const groupedIncomes = incomes.reduce((acc, income) => {
    const dateKey = formatDate(income.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(income);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedIncomes).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <AnimatePresence>
          {sortedDates.map((date, dateIndex) => {
            const dailyIncomes = groupedIncomes[date];
            const dailyTotal = calculateDailyTotal(dailyIncomes);
            
            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
                className="border-b border-gray-100/80 last:border-b-0"
              >
                {/* Enhanced Sticky Header */}
                <div className="backdrop-blur-lg bg-gradient-to-r from-gray-50 to-green-50/30 px-8 py-6 sticky top-0 z-20 border-b border-gray-200/60 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg" />
                      <h2 className="text-2xl font-bold text-gray-900">
                        {date}
                      </h2>
                    </div>
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

                {/* Enhanced Table */}
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
                        {["Category", "Amount", "Note", "Actions"].map((header, index) => (
                          <th
                            key={header}
                            className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider"
                          >
                            <div className="flex items-center gap-2">
                              {header}
                              {header === "Amount" && (
                                <TrendingUp size={14} className="text-gray-400" />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      <AnimatePresence>
                        {dailyIncomes.map((income, incomeIndex) => {
                          const category = income.category || {};
                          const categoryName = category.name || "Uncategorized";
                          const categoryColor = category.color || "#10B981";
                          const rowBgColor = getRowBackgroundColor(incomeIndex);
                          const hoverGradient = getHoverGradient(incomeIndex);

                          return (
                            <motion.tr
                              key={income._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (dateIndex * 0.1) + (incomeIndex * 0.05) }}
                              className={`group bg-gradient-to-r ${rowBgColor} ${hoverGradient} transition-all duration-300 border-b border-gray-100/30 last:border-b-0`}
                            >
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
                                  <div 
                                    className="w-2 h-2 rounded-full bg-white/30"
                                  />
                                  {categoryName}
                                </motion.span>
                              </td>

                              {/* Amount */}
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                                    {formatCurrency(income.amount)}
                                  </span>
                                  {income.note && (
                                    <span className="text-xs text-gray-400 mt-1 group-hover:text-gray-500 transition-colors">
                                      {new Date(income.date).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Note */}
                              <td className="px-6 py-5">
                                <div className="max-w-xs">
                                  {income.note ? (
                                    <motion.p 
                                      className="text-gray-700 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-900 transition-colors"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      {income.note}
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
                                    onClick={() => router.push(`/income/edit/${income._id}`)}
                                    className="p-2.5 bg-white text-green-600 rounded-xl border border-green-200/60 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow-md group/btn"
                                  >
                                    <Pencil size={18} />
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                      Edit
                                    </span>
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.1, y: -1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteIncome(income._id)}
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
        className="bg-gradient-to-r from-gray-50 to-green-50/30 px-8 py-6 border-t border-gray-200/60"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total <span className="font-semibold">{incomes.length}</span> income records across <span className="font-semibold">{sortedDates.length}</span> days
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/income/add")}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Income
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}