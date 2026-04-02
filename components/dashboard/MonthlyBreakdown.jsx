import { CalendarRange, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MonthlyBreakdown({ dashboardData, formatCurrency }) {
  const rows = dashboardData?.monthlyBreakdown || [];

  const formatMonth = (key) => {
    const [year, month] = key.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monthly Breakdown</h2>
          <p className="text-gray-500 text-sm">
            Income vs Expenses - month on month
          </p>
        </div>
        <div className="p-3 bg-indigo-100 rounded-xl">
          <CalendarRange className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No data for this period.
        </p>
      ) : (
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
