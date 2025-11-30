"use client";

import { TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function BudgetStats({ stats, formatCurrency }) {
  if (!stats) return null;

  const { overallStats } = stats;

  const statCards = [
    {
      label: "Total Budget",
      value: formatCurrency(overallStats.totalBudget),
      icon: Target,
      color: "purple",
      description: "Combined budget amount"
    },
    {
      label: "Total Spent",
      value: formatCurrency(overallStats.totalSpent),
      icon: TrendingUp,
      color: "blue",
      description: "Across all budgets"
    },
    {
      label: "Remaining",
      value: formatCurrency(overallStats.totalRemaining),
      icon: CheckCircle,
      color: "green",
      description: "Available to spend"
    },
    {
      label: "Exceeded Budgets",
      value: overallStats.exceededBudgets,
      icon: AlertTriangle,
      color: "red",
      description: "Need attention"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <div className={`text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-700`}>
              {stat.label.includes('Exceeded') && overallStats.exceededBudgets > 0 ? 'Alert' : 'Normal'}
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stat.value}
          </h3>
          <p className="text-sm text-gray-500">
            {stat.description}
          </p>

          {/* Progress bar for overall spending */}
          {stat.label === "Total Spent" && overallStats.totalBudget > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Usage</span>
                <span>{Math.min(overallStats.overallPercentage, 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    overallStats.overallPercentage >= 100 
                      ? 'bg-red-500' 
                      : overallStats.overallPercentage >= 80 
                      ? 'bg-orange-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(overallStats.overallPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}