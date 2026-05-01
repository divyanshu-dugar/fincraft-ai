import {
  RefreshCw,
  Calendar as CalendarIcon,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react";

export function DashboardHeader({
  timeRange,
  setTimeRange,
  loadDashboardData,
  showCustomDatePicker,
  setShowCustomDatePicker,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  handleCustomDateApply,
  handleCustomDateReset,
  formatDateForDisplay,
}) {
  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-cyan-400/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:h-16 gap-2 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Fincraft Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Your financial command center
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="relative shrink-0">
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {["weekly", "monthly", "yearly"].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setShowCustomDatePicker(false);
                    }}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      timeRange === range
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setShowCustomDatePicker(!showCustomDatePicker)
                  }
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 whitespace-nowrap ${
                    timeRange === "custom"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700"
                  }`}
                >
                  <CalendarIcon size={16} />
                  <span>Custom</span>
                  {timeRange === "custom" && (
                    <X
                      size={12}
                      className="ml-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCustomDateReset();
                      }}
                    />
                  )}
                </button>
              </div>

              {/* Custom Date Picker Dropdown */}
              {showCustomDatePicker && (
                <div className="custom-date-picker fixed inset-x-3 top-auto mt-2 sm:absolute sm:inset-x-auto sm:right-0 w-auto sm:w-80 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">
                      Select Date Range
                    </h3>
                    <button
                      onClick={() => setShowCustomDatePicker(false)}
                      className="p-1 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-600 text-slate-800 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 [color-scheme:dark]"
                        max={
                          customEndDate ||
                          new Date().toISOString().split("T")[0]
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-600 text-slate-800 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 [color-scheme:dark]"
                        min={customStartDate}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleCustomDateReset}
                        className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleCustomDateApply}
                        disabled={!customStartDate || !customEndDate}
                        className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                          !customStartDate || !customEndDate
                            ? "bg-slate-600 cursor-not-allowed text-slate-600 dark:text-slate-400"
                            : "bg-cyan-600 hover:bg-cyan-500"
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Quick date presets */}
                  <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">
                      Quick Select:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const now = new Date();
                          const start = new Date();
                          start.setDate(now.getDate() - 30);
                          setCustomStartDate(
                            start.toISOString().split("T")[0]
                          );
                          setCustomEndDate(now.toISOString().split("T")[0]);
                        }}
                        className="text-xs px-3 py-1.5 text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
                      >
                        Last 30 Days
                      </button>
                      <button
                        onClick={() => {
                          const now = new Date();
                          const start = new Date();
                          start.setFullYear(now.getFullYear(), 0, 1);
                          setCustomStartDate(
                            start.toISOString().split("T")[0]
                          );
                          setCustomEndDate(now.toISOString().split("T")[0]);
                        }}
                        className="text-xs px-3 py-1.5 text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
                      >
                        Year to Date
                      </button>
                      <button
                        onClick={() => {
                          const now = new Date();
                          const start = new Date();
                          start.setMonth(now.getMonth() - 3);
                          setCustomStartDate(
                            start.toISOString().split("T")[0]
                          );
                          setCustomEndDate(now.toISOString().split("T")[0]);
                        }}
                        className="text-xs px-3 py-1.5 text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
                      >
                        Last 3 Months
                      </button>
                      <button
                        onClick={() => {
                          const now = new Date();
                          const start = new Date();
                          start.setMonth(now.getMonth() - 6);
                          setCustomStartDate(
                            start.toISOString().split("T")[0]
                          );
                          setCustomEndDate(now.toISOString().split("T")[0]);
                        }}
                        className="text-xs px-3 py-1.5 text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
                      >
                        Last 6 Months
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={loadDashboardData}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors shrink-0"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-slate-600 dark:text-slate-400" />
            </button>

            <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow whitespace-nowrap shrink-0">
              Export Report
            </button>
          </div>
        </div>

        {/* Selected Date Range Display */}
        {timeRange === "custom" && customStartDate && customEndDate && (
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 pb-2">
            <Calendar size={14} className="mr-1" />
            <span>
              {formatDateForDisplay(customStartDate)} -{" "}
              {formatDateForDisplay(customEndDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
