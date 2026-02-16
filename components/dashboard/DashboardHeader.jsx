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
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fincraft Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Your financial command center
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                {["weekly", "monthly", "yearly"].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setShowCustomDatePicker(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setShowCustomDatePicker(!showCustomDatePicker)
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                    timeRange === "custom"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
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
                <div className="custom-date-picker absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Select Date Range
                    </h3>
                    <button
                      onClick={() => setShowCustomDatePicker(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        max={
                          customEndDate ||
                          new Date().toISOString().split("T")[0]
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={customStartDate}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleCustomDateReset}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleCustomDateApply}
                        disabled={!customStartDate || !customEndDate}
                        className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                          !customStartDate || !customEndDate
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Quick date presets */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
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
                        className="text-xs px-3 py-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
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
                        className="text-xs px-3 py-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
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
                        className="text-xs px-3 py-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
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
                        className="text-xs px-3 py-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
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
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>

            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-shadow">
              Export Report
            </button>
          </div>
        </div>

        {/* Selected Date Range Display */}
        {timeRange === "custom" && customStartDate && customEndDate && (
          <div className="flex items-center text-sm text-gray-600 pb-2">
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
