import { PieChart, MoreVertical } from "lucide-react";

export function CategoryBreakdown({ dashboardData, formatCurrency, getCategoryIcon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Spending by Category
          </h2>
          <p className="text-gray-500 text-sm">
            Top expense categories this period
          </p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {dashboardData?.categories?.expenses?.map((category, index) => {
          const Icon = getCategoryIcon(category.name);
          const percentage =
            (category.totalAmount /
              dashboardData.overview.totalExpenses) *
            100;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.count || 1} transaction(s)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(category.totalAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  {percentage.toFixed(1)}% of total
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {(!dashboardData?.categories?.expenses ||
        dashboardData.categories.expenses.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No expense data available</p>
        </div>
      )}
    </div>
  );
}
