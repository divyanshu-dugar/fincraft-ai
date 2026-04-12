"use client";

import { useState } from "react";
import { CalendarRange, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";

export function MonthlyBreakdown({ dashboardData, formatCurrency }) {
  const rows = dashboardData?.monthlyBreakdown || [];
  const [collapsed, setCollapsed] = useState(false);

  const formatMonth = (key) => {
    const [year, month] = key.split("-");
    return new Date(Date.UTC(year, month - 1)).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // Totals row
  const totals = rows.reduce(
    (acc, r) => ({
      income: acc.income + r.income,
      expense: acc.expense + r.expense,
      variance: acc.variance + r.variance,
    }),
    { income: 0, expense: 0, variance: 0 }
  );

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Monthly Breakdown</h2>
          <p className="text-slate-400 text-sm">
            Income vs Expenses — month on month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {collapsed ? (
              <>
                <ChevronDown size={14} /> Expand
              </>
            ) : (
              <>
                <ChevronUp size={14} /> Collapse
              </>
            )}
          </button>
          <div className="p-2.5 bg-indigo-500/20 rounded-xl">
            <CalendarRange className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Totals summary — always visible */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-500/15 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-400 font-medium mb-1">Total Income</p>
          <p className="text-base font-bold text-emerald-300">{formatCurrency(totals.income)}</p>
        </div>
        <div className="bg-rose-500/15 rounded-xl p-3 text-center">
          <p className="text-xs text-rose-400 font-medium mb-1">Total Expense</p>
          <p className="text-base font-bold text-rose-300">{formatCurrency(totals.expense)}</p>
        </div>
        <div className={`${totals.variance >= 0 ? "bg-blue-500/15" : "bg-orange-500/15"} rounded-xl p-3 text-center`}>
          <p className={`text-xs font-medium mb-1 ${totals.variance >= 0 ? "text-blue-400" : "text-orange-400"}`}>Net Variance</p>
          <p className={`text-base font-bold ${totals.variance >= 0 ? "text-blue-300" : "text-orange-300"}`}>
            {totals.variance >= 0 ? "+" : ""}{formatCurrency(totals.variance)}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CalendarRange className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-white font-semibold text-sm mb-1">No monthly data yet</p>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">Add expenses or income to see your month-by-month financial breakdown.</p>
        </div>
      ) : !collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.month}
                  className={`border-b border-slate-700/50 ${
                    i % 2 === 0 ? "bg-slate-700/20" : ""
                  } hover:bg-slate-700/40 transition-colors`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-slate-200">
                    {formatMonth(row.month)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-emerald-400">
                    {formatCurrency(row.income)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-rose-400">
                    {formatCurrency(row.expense)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        row.variance > 0
                          ? "text-emerald-400"
                          : row.variance < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {row.variance > 0 ? (
                        <TrendingUp size={14} />
                      ) : row.variance < 0 ? (
                        <TrendingDown size={14} />
                      ) : (
                        <Minus size={14} />
                      )}
                      {row.variance >= 0 ? "+" : ""}
                      {formatCurrency(row.variance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-600">
                <td className="py-3 px-4 text-sm font-bold text-white">
                  Total
                </td>
                <td className="py-3 px-4 text-sm text-right font-bold text-emerald-400">
                  {formatCurrency(totals.income)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-bold text-rose-400">
                  {formatCurrency(totals.expense)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-bold ${
                      totals.variance > 0
                        ? "text-emerald-400"
                        : totals.variance < 0
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  >
                    {totals.variance > 0 ? (
                      <TrendingUp size={14} />
                    ) : totals.variance < 0 ? (
                      <TrendingDown size={14} />
                    ) : (
                      <Minus size={14} />
                    )}
                    {totals.variance >= 0 ? "+" : ""}
                    {formatCurrency(totals.variance)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
