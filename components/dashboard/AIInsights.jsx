import { Brain, Sparkles } from "lucide-react";

export function AIInsights({ insights }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    insight.type === "success"
                      ? "bg-emerald-900/30 text-emerald-400"
                      : insight.type === "warning"
                      ? "bg-amber-900/30 text-amber-400"
                      : "bg-blue-900/30 text-blue-400"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">
                    {insight.title}
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">
              Add more data to generate insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
