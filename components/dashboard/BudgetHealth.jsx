import { Target } from "lucide-react";

export function BudgetHealth({ dashboardData }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Budget Health
          </h2>
          <p className="text-gray-500 text-sm">
            {dashboardData?.budgets?.total || 0} active budgets
          </p>
        </div>
        <Target className="w-5 h-5 text-blue-500" />
      </div>

      {dashboardData?.budgets?.total > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-700">
                {dashboardData.budgets.onTrack}
              </div>
              <div className="text-xs text-emerald-600">On Track</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {dashboardData.budgets.limitReached}
              </div>
              <div className="text-xs text-blue-600">Limit Reached</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">
                {dashboardData.budgets.almostExceeded}
              </div>
              <div className="text-xs text-orange-600">
                Almost Exceeded
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-700">
                {dashboardData.budgets.exceeded}
              </div>
              <div className="text-xs text-red-600">Exceeded</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget Compliance</span>
              <span className="font-semibold text-gray-900">
                {Math.round(
                  (dashboardData.budgets.onTrack /
                    dashboardData.budgets.total) *
                    100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
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
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No active budgets</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Create First Budget
          </button>
        </div>
      )}
    </div>
  );
}
