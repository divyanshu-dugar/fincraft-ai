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
    <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monthly Breakdown</h2>
          <p className="text-gray-500 text-sm">
            Income vs Expenses — month on month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <CalendarRange className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Totals summary — always visible */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-600 font-medium mb-1">Total Income</p>
          <p className="text-base font-bold text-emerald-700">{formatCurrency(totals.income)}</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-3 text-center">
          <p className="text-xs text-rose-600 font-medium mb-1">Total Expense</p>
          <p className="text-base font-bold text-rose-700">{formatCurrency(totals.expense)}</p>
        </div>
        <div className={`${totals.variance >= 0 ? "bg-blue-50" : "bg-orange-50"} rounded-xl p-3 text-center`}>
          <p className={`text-xs font-medium mb-1 ${totals.variance >= 0 ? "text-blue-600" : "text-orange-600"}`}>Net Variance</p>
          <p className={`text-base font-bold ${totals.variance >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {totals.variance >= 0 ? "+" : ""}{formatCurrency(totals.variance)}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No data for this period.
        </p>
      ) : !collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.month}
                  className={`border-b border-gray-50 ${
                    i % 2 === 0 ? "bg-gray-50/40" : ""
                  } hover:bg-blue-50/40 transition-colors`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {formatMonth(row.month)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-emerald-600">
                    {formatCurrency(row.income)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-red-500">
                    {formatCurrency(row.expense)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        row.variance > 0
                          ? "text-emerald-600"
                          : row.variance < 0
                          ? "text-red-500"
                          : "text-gray-400"
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
              <tr className="border-t-2 border-gray-200">
                <td className="py-3 px-4 text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="py-3 px-4 text-sm text-right font-bold text-emerald-600">
                  {formatCurrency(totals.income)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-bold text-red-500">
                  {formatCurrency(totals.expense)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-bold ${
                      totals.variance > 0
                        ? "text-emerald-600"
                        : totals.variance < 0
                        ? "text-red-500"
                        : "text-gray-400"
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
