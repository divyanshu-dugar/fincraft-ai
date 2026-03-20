"use client";

import { useState } from "react";
import {
  calculateMonthlySavings,
  calculateYearlySavings,
  calculateDailySavings,
  calculateAmountRemaining,
} from "@/lib/goalsUtils";

export default function GoalCard({
  goal,
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
  const [inputValue, setInputValue] = useState("");
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isAddingAmount, setIsAddingAmount] = useState(false);
  const [editAmount, setEditAmount] = useState(
    goal.savedAmount ? parseFloat(goal.savedAmount).toFixed(2) : "0.00"
  );
  const [showSavingsDetails, setShowSavingsDetails] = useState(false);
  
  const daysRemaining = getDaysRemaining(goal.deadline);
  const progress = Math.min((goal.savedAmount / goal.amount) * 100, 100);

  // Calculate savings needed
  const amountRemaining = calculateAmountRemaining(goal.amount, goal.savedAmount);
  const dailySavings = calculateDailySavings(goal.amount, daysRemaining, goal.savedAmount);
  const monthlySavings = calculateMonthlySavings(
    goal.amount,
    daysRemaining,
    goal.savedAmount
  );
  const yearlySavings = calculateYearlySavings(
    goal.amount,
    daysRemaining,
    goal.savedAmount
  );

  const handleAddAmount = (amountToAdd) => {
    const newTotal = (goal.savedAmount || 0) + amountToAdd;
    onUpdateSavedAmount(goal._id, newTotal);
    setInputValue("");
    setIsAddingAmount(false);
  };

  const handleManualSave = () => {
    const amountToAdd = parseFloat(inputValue) || 0;
    if (amountToAdd > 0) {
      const newTotal = (goal.savedAmount || 0) + amountToAdd;
      onUpdateSavedAmount(goal._id, newTotal);
      setInputValue("");
      setIsAddingAmount(false);
    }
  };

  const handleEditAmount = () => {
    const newAmount = parseFloat(editAmount) || 0;
    if (newAmount >= 0) {
      onUpdateSavedAmount(goal._id, newAmount);
      setIsEditingAmount(false);
    }
  };

  const handleCancelEdit = () => {
    setEditAmount(goal.savedAmount ? parseFloat(goal.savedAmount).toFixed(2) : "0.00");
    setIsEditingAmount(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-500 group">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${getPriorityColor(
          goal.priority
        )} p-4 rounded-t-2xl`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getPriorityIcon(goal.priority)}</span>
            <span className="text-white font-semibold capitalize">
              {goal.priority} Priority
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(goal)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(goal._id)}
              className="text-white/80 hover:text-red-300 cursor-pointer"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
          {goal.name}
        </h3>
        <p className="text-gray-600 text-sm">
          {goal.description || "No description provided"}
        </p>

        {/* Target and Deadline */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Target Amount</span>
            <span className="text-2xl font-bold text-purple-600">
              {formatCurrency(goal.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Deadline</span>
            <div className="text-right">
              <div className="font-semibold text-gray-700">
                {formatDate(goal.deadline)}
              </div>
              <div
                className={`text-sm font-medium ${
                  daysRemaining < 0
                    ? "text-red-500"
                    : daysRemaining < 30
                    ? "text-orange-500"
                    : "text-green-500"
                }`}
              >
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days remaining`}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-semibold text-gray-700">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Toggle Savings Details Button */}
        <button
          onClick={() => setShowSavingsDetails(!showSavingsDetails)}
          className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
        >
          {showSavingsDetails ? "Hide" : "Show"} Savings Plan
        </button>

        {/* Savings Calculation Section - Collapsible */}
        {showSavingsDetails && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl space-y-3 border border-purple-100/50">
            <div className="grid grid-cols-2 gap-3">
              {/* Amount Remaining */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Amount Remaining</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(amountRemaining)}
                </div>
              </div>

              {/* Daily Savings */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Per Day</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(dailySavings)}
                </div>
              </div>

              {/* Monthly Savings */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Per Month</div>
                <div className="text-lg font-bold text-indigo-600">
                  {formatCurrency(monthlySavings)}
                </div>
              </div>

              {/* Yearly Savings - Only show if days > 365 */}
              {daysRemaining > 365 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600">Per Year</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {formatCurrency(yearlySavings)}
                  </div>
                </div>
              )}
            </div>

            {/* Info text */}
            {daysRemaining > 0 && (
              <div className="text-xs text-gray-600 pt-2 border-t border-purple-100">
                Save {formatCurrency(amountRemaining)} in {daysRemaining} days to reach your goal
              </div>
            )}
          </div>
        )}

        {/* Saved Amount Update - SaaS Style */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
          {/* Current Saved Amount Display */}
          {!isEditingAmount && !isAddingAmount ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-gray-600 text-sm font-medium">Amount Saved</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(goal.savedAmount || 0)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEditAmount(goal.savedAmount ? parseFloat(goal.savedAmount).toFixed(2) : "0.00");
                    setIsEditingAmount(true);
                  }}
                  className="px-3 py-2.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setIsAddingAmount(true)}
                  className="px-3 py-2.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors cursor-pointer border border-green-200"
                >
                  ➕ Add
                </button>
              </div>
            </div>
          ) : null}

          {/* Edit Mode */}
          {isEditingAmount && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="space-y-1">
                <label className="text-gray-600 text-sm font-medium">Set Amount Saved</label>
                <div className="text-xs text-gray-500">Current: {formatCurrency(goal.savedAmount || 0)}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    autoFocus
                    className="w-full pl-7 pr-3 py-2.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={() => {
                    const newAmount = parseFloat(editAmount) || 0;
                    if (newAmount >= 0) {
                      onUpdateSavedAmount(goal._id, newAmount);
                      setIsEditingAmount(false);
                    }
                  }}
                  className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditAmount(goal.savedAmount ? parseFloat(goal.savedAmount).toFixed(2) : "0.00");
                    setIsEditingAmount(false);
                  }}
                  className="px-4 py-2.5 bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-400 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Mode */}
          {isAddingAmount && (
            <div className="space-y-3 bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-baseline justify-between">
                <label className="text-gray-600 text-sm font-medium">Add to Savings</label>
                <span className="text-xs text-gray-500">Current: {formatCurrency(goal.savedAmount || 0)}</span>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddAmount(dailySavings)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                  title={`Add today's target: ${formatCurrency(dailySavings)}`}
                >
                  +{formatCurrency(dailySavings)}
                  <div className="text-xs font-normal text-blue-600">Today</div>
                </button>

                <button
                  onClick={() => handleAddAmount(monthlySavings)}
                  className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
                  title={`Add monthly target: ${formatCurrency(monthlySavings)}`}
                >
                  +{formatCurrency(monthlySavings)}
                  <div className="text-xs font-normal text-indigo-600">Monthly</div>
                </button>
              </div>

              {/* Custom Input */}
              <div className="space-y-2 pt-2 border-t border-green-200">
                <label className="text-xs font-medium text-gray-600">Or Enter Custom Amount</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleManualSave();
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={handleManualSave}
                    disabled={!inputValue || parseFloat(inputValue) <= 0}
                    className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsAddingAmount(false)}
                className="w-full px-3 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
