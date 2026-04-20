import { Brain, Sparkles } from "lucide-react";

export function AIInsights({ insights }) {
  return (
    <div className="bg-gradient-to-br from-slate-100/80 dark:from-slate-800/80 to-white/80 dark:to-slate-900/80 rounded-2xl border border-cyan-400/20 shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Insights</h2>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-600/50"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    insight.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : insight.type === "warning"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {insight.title}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 text-xs mt-1">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-900 dark:text-white font-semibold text-sm mb-1">No insights yet</p>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">
              Add a few expenses and income entries — AI insights will appear automatically as patterns emerge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
