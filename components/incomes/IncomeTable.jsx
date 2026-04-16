"use client";

import { Pencil, Trash2, TrendingUp, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IncomeTable({
  incomes = [],
  router,
  deleteIncome,
  formatCurrency = (v) => `$${v.toFixed(2)}`,
  formatDate,
  currentMonth,
  currentYear,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
}) {
  const allSelected = incomes.length > 0 && incomes.every((e) => selectedIds.has(e._id));
  const someSelected = incomes.some((e) => selectedIds.has(e._id));

  const calculateDailyTotal = (incomes) => {
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  };

  const formatIncomeTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Case: No incomes
  if (!incomes || incomes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 rounded-3xl text-center py-20 border border-cyan-400/20"
      >
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/15 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-3">
            No income yet
          </h3>
          <p className="text-slate-400 text-lg mb-8">
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
    const dateKey = new Date(income.date).toISOString().split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        label: formatDate(income.date),
        items: [],
      };
    }
    acc[dateKey].items.push(income);
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(groupedIncomes).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 overflow-hidden"
    >
      <div>
        <AnimatePresence>
          {sortedDateKeys.map((dateKey, dateIndex) => {
            const group = groupedIncomes[dateKey];
            const dailyIncomes = group.items;
            const dailyTotal = calculateDailyTotal(dailyIncomes);

            return (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
                className="border-b border-slate-700/50 last:border-b-0"
              >
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 px-4 md:px-6 py-3 border-b border-emerald-700/70">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.2),transparent_40%)]" />
                  <div className="relative flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm md:text-base font-semibold text-white">
                        {group.label}
                      </h2>
                      <span className="inline-flex items-center rounded-full bg-white/15 text-emerald-50 text-[11px] font-semibold px-2 py-0.5 border border-white/25 backdrop-blur-sm">
                        {dailyIncomes.length} item{dailyIncomes.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-right px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm">
                      <div className="text-[10px] font-semibold text-emerald-100 uppercase tracking-[0.15em]">
                        Daily Total
                      </div>
                      <div className="text-sm md:text-base font-bold text-white mt-0.5">
                        {formatCurrency(dailyTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block px-4 md:px-6 py-4 overflow-x-auto bg-slate-800/80 border-y border-slate-700/50">
                  <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0">
                    <colgroup>
                      <col className="w-[5%]" />
                      <col className="w-[27%]" />
                      <col className="w-[18%]" />
                      <col className="w-[35%]" />
                      <col className="w-[15%]" />
                    </colgroup>

                    <thead>
                      <tr className="bg-slate-800/60 text-left">
                        <th className="px-3 py-3.5 border-b-2 border-emerald-700/50">
                          <button
                            onClick={() => onToggleSelectAll && onToggleSelectAll(incomes)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                              allSelected
                                ? "bg-emerald-500 border-emerald-400"
                                : someSelected
                                  ? "bg-emerald-500/40 border-emerald-400/60"
                                  : "border-slate-500 hover:border-emerald-400"
                            }`}
                          >
                            {(allSelected || someSelected) && <Check size={12} className="text-white" strokeWidth={3} />}
                          </button>
                        </th>
                        {["Category", "Amount", "Note", "Actions"].map((header) => (
                          <th
                            key={header}
                            className="px-4 lg:px-6 py-3.5 text-sm font-bold uppercase text-emerald-400 tracking-[0.14em] border-b-2 border-emerald-700/50"
                          >
                            <div className="flex items-center gap-2">
                              {header}
                              {header === "Amount" && (
                                <TrendingUp size={15} className="text-emerald-700" />
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

                          return (
                            <motion.tr
                              key={income._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: dateIndex * 0.1 + incomeIndex * 0.05,
                              }}
                              className={`group border-b border-slate-700/30 last:border-b-0 odd:bg-slate-800/80 even:bg-slate-800/40 hover:bg-slate-700/40 transition-colors ${selectedIds.has(income._id) ? "!bg-emerald-500/10 border-emerald-500/20" : ""}`}
                            >
                              <td className="px-3 py-4">
                                <button
                                  onClick={() => onToggleSelect && onToggleSelect(income._id)}
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                                    selectedIds.has(income._id)
                                      ? "bg-emerald-500 border-emerald-400"
                                      : "border-slate-500 hover:border-emerald-400"
                                  }`}
                                >
                                  {selectedIds.has(income._id) && <Check size={12} className="text-white" strokeWidth={3} />}
                                </button>
                              </td>
                              <td className="px-4 lg:px-6 py-4">
                                <span className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: categoryColor }}
                                  />
                                  <span className="truncate">{categoryName}</span>
                                </span>
                              </td>

                              <td className="px-4 lg:px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-base font-semibold text-white">
                                    {formatCurrency(income.amount)}
                                  </span>
                                  <span className="text-xs text-slate-400 mt-0.5">
                                    {formatIncomeTime(income.date)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 lg:px-6 py-4">
                                {income.note ? (
                                  <p
                                    className="text-sm text-slate-300 leading-relaxed line-clamp-2 break-words"
                                    title={income.note}
                                  >
                                    {income.note}
                                  </p>
                                ) : (
                                  <span className="text-sm italic text-slate-500">
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
                                      router.push(`/income/edit/${income._id}${currentMonth !== undefined && currentYear !== undefined ? `?month=${currentMonth}&year=${currentYear}` : ""}`)
                                    }
                                    className="relative p-2 bg-slate-700/50 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/15 hover:border-emerald-500/50 transition-all duration-200 group/btn"
                                    aria-label="Edit income"
                                  >
                                    <Pencil size={16} />
                                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                      Edit
                                    </span>
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.06, y: -1 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => deleteIncome(income._id)}
                                    className="relative p-2 bg-slate-700/50 text-rose-400 rounded-lg border border-rose-500/30 hover:bg-rose-500/15 hover:border-rose-500/50 transition-all duration-200 group/btn"
                                    aria-label="Delete income"
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

                {/* Mobile cards */}
                <div className="md:hidden px-4 pb-4 pt-3 space-y-3 bg-slate-800/80 border-y border-slate-700/50">
                  <AnimatePresence>
                    {dailyIncomes.map((income, incomeIndex) => {
                      const category = income.category || {};
                      const categoryName = category.name || "Uncategorized";
                      const categoryColor = category.color || "#10B981";

                      return (
                        <motion.div
                          key={income._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: dateIndex * 0.1 + incomeIndex * 0.05,
                          }}
                          className={`bg-slate-800/60 rounded-xl border p-4 ${selectedIds.has(income._id) ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-700"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onToggleSelect && onToggleSelect(income._id)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
                                  selectedIds.has(income._id)
                                    ? "bg-emerald-500 border-emerald-400"
                                    : "border-slate-500 hover:border-emerald-400"
                                }`}
                              >
                                {selectedIds.has(income._id) && <Check size={12} className="text-white" strokeWidth={3} />}
                              </button>
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: categoryColor }}
                                />
                                {categoryName}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-semibold text-white">
                                {formatCurrency(income.amount)}
                              </div>
                              <div className="text-xs text-slate-400">
                                {formatIncomeTime(income.date)}
                              </div>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                            {income.note || "No note added"}
                          </p>

                          <div className="mt-4 flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() =>
                                router.push(`/income/edit/${income._id}${currentMonth !== undefined && currentYear !== undefined ? `?month=${currentMonth}&year=${currentYear}` : ""}`)
                              }
                              className="px-3 py-2 text-sm font-medium bg-emerald-500/15 text-emerald-400 rounded-lg border border-emerald-500/30"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => deleteIncome(income._id)}
                              className="px-3 py-2 text-sm font-medium bg-rose-500/15 text-rose-400 rounded-lg border border-rose-500/30"
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
        className="bg-slate-800/80 px-5 md:px-8 py-5 border-t border-slate-700/60"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            Total <span className="font-semibold">{incomes.length}</span>{" "}
            income records across{" "}
            <span className="font-semibold">{sortedDateKeys.length}</span> days
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/income/add")}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Income
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}