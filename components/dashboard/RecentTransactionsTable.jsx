"use client";

import { useState } from "react";
import { List, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

const PREVIEW_COUNT = 5;

function TransactionRow({ t, formatCurrencyDetailed }) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
        {new Date(t.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })}
      </td>
      <td className="py-3 px-4">
        <p className="font-medium text-gray-900 text-sm truncate max-w-[160px]">
          {t.note || "No description"}
        </p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: t.category?.color || "#9CA3AF" }}
          />
          <span className="text-sm text-gray-600 truncate max-w-[100px]">
            {t.category?.name || "Uncategorized"}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            t.__typename === "Income"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
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
    all: "bg-gray-800 text-white",
    expense: "bg-blue-100 text-blue-700",
    income: "bg-emerald-100 text-emerald-700",
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
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
      <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-gray-500 text-sm">
              {allTransactions.length} transactions this period
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter size={13} />
              Full View
            </button>
            <button
              onClick={() => router.push("/expense/list")}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              Expenses →
            </button>
            <button
              onClick={() => router.push("/income/list")}
              className="text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors"
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
              <tr className="border-b border-gray-100">
                {["Date", "Description", "Category", "Type", "Amount"].map((h) => (
                  <th
                    key={h}
                    className={`py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider ${
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
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <List className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">No transactions yet</p>
            </div>
          )}
        </div>

        {/* Expand / collapse */}
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
                <p className="text-gray-500 text-sm">
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
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
              <FilterPills value={filterType} onChange={setFilterType} />
              <span className="ml-auto text-xs text-gray-400">
                {applyFilter(allTransactions, filterType).length} results
              </span>
            </div>

            {/* Scrollable table */}
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-white border-b border-gray-100">
                  <tr>
                    {["Date", "Description", "Category", "Type", "Amount"].map((h) => (
                      <th
                        key={h}
                        className={`py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider ${
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
                <div className="text-center py-10 text-gray-400 text-sm">
                  No transactions match this filter
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2 justify-end bg-gray-50/50">
              <button
                onClick={() => {
                  router.push("/expense/list");
                  setModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                Expense List
              </button>
              <button
                onClick={() => {
                  router.push("/income/list");
                  setModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                Income List
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
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

