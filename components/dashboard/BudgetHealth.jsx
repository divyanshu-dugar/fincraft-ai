import { Target } from "lucide-react";

export function BudgetHealth({ dashboardData }) {
  return (
    <div className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Budget Health
          </h2>
          <p className="text-slate-400 text-sm">
            {dashboardData?.budgets?.total || 0} active budgets
          </p>
        </div>
        <Target className="w-5 h-5 text-cyan-400" />
      </div>

      {dashboardData?.budgets?.total > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/15 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-300">
                {dashboardData.budgets.onTrack}
              </div>
              <div className="text-xs text-emerald-400">On Track</div>
            </div>
            <div className="bg-blue-500/15 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">
                {dashboardData.budgets.limitReached}
              </div>
              <div className="text-xs text-blue-400">Limit Reached</div>
            </div>
            <div className="bg-orange-500/15 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-300">
                {dashboardData.budgets.almostExceeded}
              </div>
              <div className="text-xs text-orange-400">
                Almost Exceeded
              </div>
            </div>
            <div className="bg-red-500/15 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-300">
                {dashboardData.budgets.exceeded}
              </div>
              <div className="text-xs text-red-400">Exceeded</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Budget Compliance</span>
              <span className="font-semibold text-white">
                {Math.round(
                  (dashboardData.budgets.onTrack /
                    dashboardData.budgets.total) *
                    100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{
                  width: `${
                    (dashboardData.budgets.onTrack /
                      dashboardData.budgets.total) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 mb-4">No active budgets</p>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">
            Create First Budget
          </button>
        </div>
      )}
    </div>
  );
}
