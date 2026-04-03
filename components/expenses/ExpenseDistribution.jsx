'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ExpenseDistribution({
  stats,
  formatCurrency,
}) {
  if (!stats?.categoryStats?.length) return null;

  // 🟢 Prepare chart data
  const chartData = stats.categoryStats.map((entry) => ({
    name: entry.category?.name || 'Uncategorized',
    value: entry.totalAmount,
    colorClass: entry.category.color,
  }));

  // 🟢 Use color from DB directly (fallback to gray)
  const COLORS = chartData.map(({ colorClass }) => colorClass || '#9ca3af');

  return (
    <div className="bg-slate-800/60 border border-cyan-400/20 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-6">
        Expense Distribution by Category
      </h2>

      {/* 🧩 Chart Section */}
      <div className="w-full h-80 mb-8">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              labelLine={false}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(1)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 🧾 Text Breakdown Section */}
      <div className="space-y-3">
        {stats.categoryStats.map((entry, index) => {
          const percentage =
            (entry.totalAmount / stats.totalExpenses) * 100;
          const colorClass = entry.category.color;
          const name = entry.category?.name || 'Uncategorized';

          return (
            <div
              key={entry.category?._id || index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorClass || '#9ca3af' }}
              ></div>
                <span className="font-medium text-slate-300">{name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white w-24 text-right">
                  {formatCurrency(entry.totalAmount)}
                </span>
                <span className="text-sm text-slate-400 w-12 text-right">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
