"use client";

import { useState } from "react";
import { List, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

const PREVIEW_COUNT = 5;

function TransactionRow({ t, formatCurrencyDetailed }) {
  return (
    <tr className="border-b border-slate-300/50 dark:border-slate-700/50 last:border-0 hover:bg-slate-200/40 dark:bg-slate-700/40 transition-colors">
      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
        {new Date(t.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })}
      </td>
      <td className="py-3 px-4">
        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate max-w-[160px]">
          {t.note || "No description"}
        </p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: t.category?.color || "#9CA3AF" }}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
            {t.category?.name || "Uncategorized"}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            t.__typename === "Income"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {t.__typename === "Income" ? "Income" : "Expense"}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <p
          className={`font-semibold text-sm ${
            t.__typename === "Income" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {t.__typename === "Income" ? "+" : "-"}
          {formatCurrencyDetailed(t.amount)}
        </p>
      </td>
    </tr>
  );
}

function FilterPills({ value, onChange }) {
  const filters = ["all", "expense", "income"];
  const pillStyle = {
    all: "bg-cyan-500/30 text-cyan-300",
    expense: "bg-blue-500/20 text-blue-400",
    income: "bg-emerald-500/20 text-emerald-400",
  };
  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            value === f
              ? pillStyle[f]
              : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700"
          }`}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function RecentTransactionsTable({ dashboardData, formatCurrencyDetailed }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const allTransactions = dashboardData?.recentTransactions || [];

  const applyFilter = (list, type) =>
    type === "all"
      ? list
      : list.filter((t) =>
          type === "income" ? t.__typename === "Income" : t.__typename !== "Income"
        );

  const filtered = applyFilter(allTransactions, filterType);
  const displayed = expanded ? filtered : filtered.slice(0, PREVIEW_COUNT);
  const hasMore = filtered.length > PREVIEW_COUNT;

  return (
    <>
      <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {allTransactions.length} transactions this period
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
            >
              <Filter size={13} />
              Full View
            </button>
            <button
              onClick={() => router.push("/expense/list")}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Expenses →
            </button>
            <button
              onClick={() => router.push("/income/list")}
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              Income →
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mb-4">
          <FilterPills value={filterType} onChange={setFilterType} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700">
                {["Date", "Description", "Category", "Type", "Amount"].map((h) => (
                  <th
                    key={h}
                    className={`py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider ${
                      h === "Amount" ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((t, i) => (
                <TransactionRow key={i} t={t} formatCurrencyDetailed={formatCurrencyDetailed} />
              ))}
            </tbody>
          </table>

          {allTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <List className="w-7 h-7 text-slate-500" />
              </div>
              <p className="text-slate-900 dark:text-white font-semibold text-sm mb-1">No transactions yet</p>
              <p className="text-slate-500 text-xs max-w-xs mx-auto mb-4">Start tracking your finances by adding an expense or income entry.</p>
              <div className="flex items-center justify-center gap-3">
                <a href="/expense/add" className="px-4 py-2 bg-rose-500/15 text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/30 hover:bg-rose-500/25 transition-colors">+ Add Expense</a>
                <a href="/income/add" className="px-4 py-2 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors">+ Add Income</a>
              </div>
            </div>
          )}
        </div>

        {/* Expand / collapse */}
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show All {filtered.length} Transactions
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Full-screen Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-300 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Transactions</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {allTransactions.length} total this period
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal filter bar */}
            <div className="px-6 py-3 border-b border-slate-300 dark:border-slate-700 flex items-center gap-3">
              <FilterPills value={filterType} onChange={setFilterType} />
              <span className="ml-auto text-xs text-slate-500">
                {applyFilter(allTransactions, filterType).length} results
              </span>
            </div>

            {/* Scrollable table */}
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
                  <tr>
                    {["Date", "Description", "Category", "Type", "Amount"].map((h) => (
                      <th
                        key={h}
                        className={`py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider ${
                          h === "Amount" ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applyFilter(allTransactions, filterType).map((t, i) => (
                    <TransactionRow key={i} t={t} formatCurrencyDetailed={formatCurrencyDetailed} />
                  ))}
                </tbody>
              </table>
              {applyFilter(allTransactions, filterType).length === 0 && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No transactions match this filter
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-300 dark:border-slate-700 flex items-center gap-2 justify-end bg-white dark:bg-slate-900/50">
              <button
                onClick={() => {
                  router.push("/expense/list");
                  setModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-500/15 hover:bg-blue-500/25 rounded-xl transition-colors"
              >
                Expense List
              </button>
              <button
                onClick={() => {
                  router.push("/income/list");
                  setModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-xl transition-colors"
              >
                Income List
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

