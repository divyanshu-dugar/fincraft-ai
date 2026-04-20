"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Gauge,
  BarChart3,
  Target,
  Info,
  Loader2,
  Database,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";
import { formatCurrency, formatPercentage } from "@/lib/dashboardUtils";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  return { Authorization: `jwt ${getToken()}`, "Content-Type": "application/json" };
}

function formatMonth(key) {
  const [year, month] = key.split("-");
  return new Date(Date.UTC(year, month - 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ConfidenceMeter({ confidence }) {
  const getColor = (c) => {
    if (c >= 75) return { bar: "from-emerald-400 to-emerald-500", text: "text-emerald-400", label: "High" };
    if (c >= 50) return { bar: "from-amber-400 to-amber-500", text: "text-amber-400", label: "Moderate" };
    return { bar: "from-rose-400 to-rose-500", text: "text-rose-400", label: "Low" };
  };
  const { bar, text, label } = getColor(confidence);

  return (
    <div className="flex items-center gap-3">
      <Gauge size={16} className={text} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-600 dark:text-slate-400">Forecast Confidence</span>
          <span className={`text-xs font-semibold ${text}`}>{label} ({confidence}%)</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${bar} transition-all duration-500`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function InsufficientDataState({ data }) {
  const { dataQuality, message } = data;

  return (
    <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-lg p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-500/15 rounded-xl shrink-0">
          <Database className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cash Flow Forecast</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">{message}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{dataQuality.totalHistoricalExpenses}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Expenses Logged</p>
            </div>
            <div className="bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{dataQuality.totalHistoricalIncome}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Income Logged</p>
            </div>
            <div className="bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{dataQuality.distinctExpenseMonths}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Months of Expenses</p>
            </div>
            <div className="bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{dataQuality.distinctIncomeMonths}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Months of Income</p>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-cyan-400 shrink-0" />
              <p className="text-xs text-cyan-300">
                For the most accurate predictions, we recommend at least {dataQuality.idealMonthsRequired} months of 
                consistent data. Adding recurring transactions also improves forecast quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CashFlowForecast() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [forecastMonths, setForecastMonths] = useState(3);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/cash-flow-forecast?months=${forecastMonths}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch forecast");
      const data = await res.json();
      setForecastData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [forecastMonths]);

  if (loading) {
    return (
      <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-lg p-6">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-3" />
          <span className="text-slate-600 dark:text-slate-400 text-sm">Analyzing your financial patterns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-red-500/20 shadow-lg p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle size={20} />
          <span className="text-sm">Could not load forecast. Please try again later.</span>
        </div>
      </div>
    );
  }

  if (forecastData && !forecastData.hasSufficientData) {
    return <InsufficientDataState data={forecastData} />;
  }

  if (!forecastData) return null;

  const { summary, forecast, confidence, budgetRisks, goalRisks, insights, categoryForecasts } = forecastData;
  const currentMonthData = forecast.find((m) => m.isCurrentMonth);

  // Calculate max for bar chart scaling
  const maxAmount = Math.max(
    ...forecast.map((m) => Math.max(m.projectedExpense, m.projectedIncome))
  );

  return (
    <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-xl">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cash Flow Forecast</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Projected income & expenses based on your patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={forecastMonths}
              onChange={(e) => setForecastMonths(Number(e.target.value))}
              className="bg-slate-200/50 dark:bg-slate-700/50 border border-slate-600 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500/50"
            >
              <option value={1}>1 month</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
        </div>

        <ConfidenceMeter confidence={confidence} />
      </div>

      {/* Current Month Snapshot */}
      {currentMonthData && (
        <div className="px-6 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            This Month&apos;s Progress
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-xs text-emerald-400 font-medium mb-1">Income</p>
              <p className="text-sm font-bold text-emerald-300">
                {formatCurrency(currentMonthData.actualIncome)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={10} className="text-emerald-500" />
                <p className="text-[10px] text-emerald-500">
                  → {formatCurrency(currentMonthData.projectedIncome)}
                </p>
              </div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <p className="text-xs text-rose-400 font-medium mb-1">Expenses</p>
              <p className="text-sm font-bold text-rose-300">
                {formatCurrency(currentMonthData.actualExpense)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={10} className="text-rose-500" />
                <p className="text-[10px] text-rose-500">
                  → {formatCurrency(currentMonthData.projectedExpense)}
                </p>
              </div>
            </div>
            <div className={`${currentMonthData.projectedNet >= 0 ? "bg-blue-500/10 border-blue-500/20" : "bg-orange-500/10 border-orange-500/20"} border rounded-xl p-3`}>
              <p className={`text-xs font-medium mb-1 ${currentMonthData.projectedNet >= 0 ? "text-blue-400" : "text-orange-400"}`}>
                Projected Net
              </p>
              <p className={`text-sm font-bold ${currentMonthData.projectedNet >= 0 ? "text-blue-300" : "text-orange-300"}`}>
                {currentMonthData.projectedNet >= 0 ? "+" : ""}{formatCurrency(currentMonthData.projectedNet)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Day {currentMonthData.daysPassed}/{currentMonthData.daysInMonth}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Chart (simple bar visualization) */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Monthly Projection
        </p>
        <div className="space-y-3">
          {forecast.map((month) => {
            const expPct = maxAmount > 0 ? (month.projectedExpense / maxAmount) * 100 : 0;
            const incPct = maxAmount > 0 ? (month.projectedIncome / maxAmount) * 100 : 0;
            return (
              <div key={month.month} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${month.isCurrentMonth ? "text-cyan-300" : "text-slate-700 dark:text-slate-300"}`}>
                      {formatMonth(month.month)}
                    </span>
                    {month.isCurrentMonth && (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${month.projectedNet >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {month.projectedNet >= 0 ? "+" : ""}{formatCurrency(month.projectedNet)}
                  </span>
                </div>
                {/* Income bar */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-emerald-500 w-6 shrink-0">In</span>
                  <div className="flex-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-emerald-400/60 transition-all duration-500"
                      style={{ width: `${Math.max(incPct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 w-20 text-right shrink-0">
                    {formatCurrency(month.projectedIncome)}
                  </span>
                </div>
                {/* Expense bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-500 w-6 shrink-0">Out</span>
                  <div className="flex-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500/80 to-rose-400/60 transition-all duration-500"
                      style={{ width: `${Math.max(expPct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 w-20 text-right shrink-0">
                    {formatCurrency(month.projectedExpense)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Smart Insights
          </p>
          <div className="space-y-2">
            {insights.map((insight) => {
              const isWarning = insight.type === "warning" || insight.type === "alert";
              return (
                <div
                  key={insight.key}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    isWarning
                      ? "bg-amber-500/10 border-amber-500/20"
                      : "bg-emerald-500/10 border-emerald-500/20"
                  }`}
                >
                  {isWarning ? (
                    <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <TrendingUp size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-xs font-semibold ${isWarning ? "text-amber-300" : "text-emerald-300"}`}>
                      {insight.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable: Budget Risks + Goal Risks + Category Breakdown */}
      <div className="px-6 pt-3 pb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Show less" : `Details${budgetRisks.length > 0 ? ` · ${budgetRisks.length} budget risk${budgetRisks.length > 1 ? "s" : ""}` : ""}${goalRisks.length > 0 ? ` · ${goalRisks.length} goal risk${goalRisks.length > 1 ? "s" : ""}` : ""}`}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Budget Risks */}
            {budgetRisks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Target size={12} />
                  Budget Risks
                </p>
                <div className="space-y-2">
                  {budgetRisks.map((risk) => (
                    <div
                      key={risk.budgetId}
                      className={`p-3 rounded-xl border ${
                        risk.riskLevel === "high"
                          ? "bg-red-500/10 border-red-500/20"
                          : risk.riskLevel === "medium"
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-yellow-500/10 border-yellow-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{risk.categoryName}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          risk.riskLevel === "high"
                            ? "bg-red-500/20 text-red-400"
                            : risk.riskLevel === "medium"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {risk.projectedPercent}% projected
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            risk.riskLevel === "high" ? "bg-red-400" : risk.riskLevel === "medium" ? "bg-amber-400" : "bg-yellow-400"
                          }`}
                          style={{ width: `${Math.min(risk.percentUsed, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                        <span>Spent: {formatCurrency(risk.currentSpent)} / {formatCurrency(risk.budgetAmount)}</span>
                        <span>{risk.daysRemaining} days left</span>
                      </div>
                      {risk.previousMonthSpent > 0 && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Last month: {formatCurrency(risk.previousMonthSpent)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goal Risks */}
            {goalRisks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Target size={12} />
                  Savings Goal Risks
                </p>
                <div className="space-y-2">
                  {goalRisks.map((risk) => (
                    <div key={risk.goalId} className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{risk.goalName}</span>
                        <span className="text-xs text-orange-400 font-medium">
                          {risk.monthsLeft} month{risk.monthsLeft > 1 ? "s" : ""} left
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        You need to save {formatCurrency(risk.requiredMonthlySavings)}/mo but your projected savings 
                        are {formatCurrency(risk.projectedMonthlySavings)}/mo — a shortfall
                        of {formatCurrency(risk.shortfall)}/mo.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Category Forecasts */}
            {categoryForecasts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <BarChart3 size={12} />
                  Expense Categories (Avg/Month)
                </p>
                <div className="space-y-1.5">
                  {categoryForecasts.map((cat, i) => {
                    const maxCat = categoryForecasts[0]?.avgMonthly || 1;
                    const pct = (cat.avgMonthly / maxCat) * 100;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-700 dark:text-slate-300 w-24 truncate">{cat.icon || "💰"} {cat.name}</span>
                        <div className="flex-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500/70 to-blue-400/50"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 w-16 text-right">{formatCurrency(cat.avgMonthly)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
