import { TrendingUp, DollarSign, CreditCard, Shield, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

export function MetricCards({ dashboardData, timeRange, formatCurrency, formatPercentage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Income Card */}
      <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl border border-emerald-100/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            dashboardData?.overview?.incomeTrend >= 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}>
            {dashboardData?.overview?.incomeTrend >= 0 ? (
              <ArrowUpRight size={12} className="mr-1" />
            ) : (
              <ArrowDownRight size={12} className="mr-1" />
            )}
            {formatPercentage(dashboardData?.overview?.incomeTrend || 0)}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {formatCurrency(dashboardData?.overview?.totalIncome || 0)}
        </h3>
        <p className="text-gray-600 text-sm">Total Income</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            {timeRange === "custom" ? "Custom Range" : timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
          </div>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              dashboardData?.overview?.expenseTrend <= 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {dashboardData?.overview?.expenseTrend <= 0 ? (
              <ArrowDownRight size={12} className="mr-1" />
            ) : (
              <ArrowUpRight size={12} className="mr-1" />
            )}
            {formatPercentage(dashboardData?.overview?.expenseTrend || 0)}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {formatCurrency(dashboardData?.overview?.totalExpenses || 0)}
        </h3>
        <p className="text-gray-600 text-sm">Total Expenses</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {dashboardData?.overview?.transactionCount || 0} transactions
          </div>
        </div>
      </div>

      {/* Net Cash Flow Card */}
      <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              dashboardData?.overview?.netCashFlow >= 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {dashboardData?.overview?.netCashFlow >= 0 ? (
              <ArrowUpRight size={12} className="mr-1" />
            ) : (
              <ArrowDownRight size={12} className="mr-1" />
            )}
            {formatPercentage(dashboardData?.overview?.savingsTrend || 0)}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {formatCurrency(dashboardData?.overview?.netCashFlow || 0)}
        </h3>
        <p className="text-gray-600 text-sm">Net Cash Flow</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {(dashboardData?.overview?.savingsRate || 0).toFixed(1)}%
            savings rate
          </div>
        </div>
      </div>

      {/* Financial Health Score Card */}
      <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-indigo-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
            {dashboardData?.financialHealth?.status
              ?.replace("_", " ")
              .toUpperCase()}
          </div>
        </div>
        <div className="flex items-end space-x-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">
            {Math.round(dashboardData?.financialHealth?.score || 0)}/100
          </h3>
          <span className="text-sm text-gray-500 mb-1">score</span>
        </div>
        <p className="text-gray-600 text-sm">Financial Health</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{
                width: `${dashboardData?.financialHealth?.score || 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}