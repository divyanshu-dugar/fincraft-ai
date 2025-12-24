"use client";

import GoalCard from "./GoalCard";
import { useState } from "react";

export default function GoalGrid({
  goals,
  onEdit,
  onDelete,
  onChangeSavedAmount,
  onUpdateSavedAmount,
  formatCurrency,
  formatDate,
  getDaysRemaining,
  getPriorityColor,
  getPriorityIcon,
}) {
  const [viewMode, setViewMode] = useState("year"); // 'priority' or 'year'

  // Helper to get year from deadline
  const getGoalYear = (deadline) => {
    if (!deadline) return "No Deadline";
    const year = new Date(deadline).getFullYear();
    return year.toString();
  };

  // Group goals by year
  const goalsByYear = goals.reduce((acc, goal) => {
    const year = getGoalYear(goal.deadline);
    if (!acc[year]) acc[year] = [];
    acc[year].push(goal);
    return acc;
  }, {});

  // Sort years: current year first, then upcoming years, then "No Deadline"
  const sortedYears = Object.keys(goalsByYear).sort((a, b) => {
    const currentYear = new Date().getFullYear().toString();

    if (a === "No Deadline") return 1;
    if (b === "No Deadline") return -1;

    if (a === currentYear) return -1;
    if (b === currentYear) return 1;

    return parseInt(a) - parseInt(b);
  });

  // Sort goals within each year by priority (high > medium > low) and then by date (soonest first)
  sortedYears.forEach((year) => {
    goalsByYear[year] = goalsByYear[year].sort((a, b) => {
      // First sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by deadline (soonest first)
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;

      return new Date(a.deadline) - new Date(b.deadline);
    });
  });

  // Get all goals sorted by priority and date for the priority view
  const goalsByPriority = [...goals].sort((a, b) => {
    // Sort by priority (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then sort by deadline (soonest first)
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;

    return new Date(a.deadline) - new Date(b.deadline);
  });

  // Group goals by priority for priority view
  const goalsByPriorityGroup = goalsByPriority.reduce((acc, goal) => {
    if (!acc[goal.priority]) acc[goal.priority] = [];
    acc[goal.priority].push(goal);
    return acc;
  }, {});

  // Priority order for display
  const priorityOrder = ["high", "medium", "low"];

  if (!goals.length) {
    return (
      <div className="bg-white/80 rounded-3xl border border-gray-100/50 shadow-xl p-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <span className="text-5xl">🎯</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-700">No Goals Yet</h3>
          <p className="text-gray-500 text-lg">
            Start your financial journey by creating your first savings goal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <div className="text-sm font-medium text-gray-700">
          {goals.length} goal{goals.length !== 1 ? "s" : ""} total
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View by:</span>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("year")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "year"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setViewMode("priority")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "priority"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Priority
            </button>
          </div>
        </div>
      </div>

      {/* Year View */}
      {viewMode === "year" && (
        <div className="space-y-8">
          {sortedYears.map((year) => {
            const yearGoals = goalsByYear[year];
            const currentYear = new Date().getFullYear().toString();
            const isCurrentYear = year === currentYear;
            const isNoDeadline = year === "No Deadline";

            return (
              <div key={year} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-10 w-10 rounded-xl ${
                        isCurrentYear
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                          : "bg-gray-100"
                      } flex items-center justify-center`}
                    >
                      <span
                        className={`font-bold ${
                          isCurrentYear ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {isNoDeadline ? "∞" : year.slice(-2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {isCurrentYear
                          ? `This Year (${year})`
                          : isNoDeadline
                          ? "No Deadline"
                          : `Year ${year}`}
                        {isCurrentYear && (
                          <span className="ml-2 text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Current
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {yearGoals.length} goal
                        {yearGoals.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {!isNoDeadline && (
                    <div className="text-sm text-gray-500">
                      {isCurrentYear ? "Due this year" : `Upcoming in ${year}`}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {yearGoals.map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onChangeSavedAmount={onChangeSavedAmount}
                      onUpdateSavedAmount={onUpdateSavedAmount}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      getDaysRemaining={getDaysRemaining}
                      getPriorityColor={getPriorityColor}
                      getPriorityIcon={getPriorityIcon}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Priority View */}
      {viewMode === "priority" && (
        <div className="space-y-8">
          {priorityOrder.map((priority) => {
            if (!goalsByPriorityGroup[priority]?.length) return null;

            const priorityLabels = {
              high: {
                label: "High Priority",
                emoji: "🔥",
                color: "from-red-500 to-pink-600",
              },
              medium: {
                label: "Medium Priority",
                emoji: "⚡",
                color: "from-yellow-500 to-orange-500",
              },
              low: {
                label: "Low Priority",
                emoji: "🌱",
                color: "from-green-500 to-emerald-600",
              },
            };

            return (
              <div key={priority} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${priorityLabels[priority].color} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {priorityLabels[priority].emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {priorityLabels[priority].label}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {goalsByPriorityGroup[priority].length} goal
                      {goalsByPriorityGroup[priority].length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {goalsByPriorityGroup[priority].map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onChangeSavedAmount={onChangeSavedAmount}
                      onUpdateSavedAmount={onUpdateSavedAmount}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      getDaysRemaining={getDaysRemaining}
                      getPriorityColor={getPriorityColor}
                      getPriorityIcon={getPriorityIcon}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
