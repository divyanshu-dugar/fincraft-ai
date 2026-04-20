import { TrendingUp, DollarSign, CreditCard, Shield, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

export function MetricCards({ dashboardData, timeRange, formatCurrency, formatPercentage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Income Card */}
      <div className="bg-gradient-to-br from-slate-100/80 dark:from-slate-800/80 to-emerald-500/5 rounded-2xl border border-emerald-500/20 p-6 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            dashboardData?.overview?.incomeTrend >= 0
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {dashboardData?.overview?.incomeTrend >= 0 ? (
              <ArrowUpRight size={12} className="mr-1" />
            ) : (
              <ArrowDownRight size={12} className="mr-1" />
            )}
            {formatPercentage(dashboardData?.overview?.incomeTrend || 0)}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {formatCurrency(dashboardData?.overview?.totalIncome || 0)}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Total Income</p>
        <div className="mt-4 pt-4 border-t border-slate-300/50 dark:border-slate-700/50">
          <div className="flex items-center text-xs text-slate-500">
            <Calendar size={12} className="mr-1" />
            {timeRange === "custom" ? "Custom Range" : timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
          </div>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-gradient-to-br from-slate-100/80 dark:from-slate-800/80 to-blue-500/5 rounded-2xl border border-blue-500/20 p-6 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              dashboardData?.overview?.expenseTrend <= 0
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
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
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {formatCurrency(dashboardData?.overview?.totalExpenses || 0)}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Total Expenses</p>
        <div className="mt-4 pt-4 border-t border-slate-300/50 dark:border-slate-700/50">
          <div className="text-xs text-slate-500">
            {dashboardData?.overview?.transactionCount || 0} transactions
          </div>
        </div>
      </div>

      {/* Net Cash Flow Card */}
      <div className="bg-gradient-to-br from-slate-100/80 dark:from-slate-800/80 to-purple-500/5 rounded-2xl border border-purple-500/20 p-6 shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              dashboardData?.overview?.netCashFlow >= 0
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
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
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {formatCurrency(dashboardData?.overview?.netCashFlow || 0)}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Net Cash Flow</p>
        <div className="mt-4 pt-4 border-t border-slate-300/50 dark:border-slate-700/50">
          <div className="text-xs text-slate-500">
            {(dashboardData?.overview?.savingsRate || 0).toFixed(1)}%
            savings rate
          </div>
        </div>
      </div>

      {/* Financial Health Score Card */}
      <div className="bg-gradient-to-br from-slate-100/80 dark:from-slate-800/80 to-cyan-500/5 rounded-2xl border border-cyan-500/20 p-6 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
            {dashboardData?.financialHealth?.status
              ?.replace("_", " ")
              .toUpperCase()}
          </div>
        </div>
        <div className="flex items-end space-x-2 mb-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round(dashboardData?.financialHealth?.score || 0)}/100
          </h3>
          <span className="text-sm text-slate-500 mb-1">score</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Financial Health</p>
        <div className="mt-4 pt-4 border-t border-slate-300/50 dark:border-slate-700/50">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
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