"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, TrendingUp, TrendingDown, Target, ChevronRight } from "lucide-react";
import { getToken } from "@/lib/authenticate";
import { formatCurrency } from "@/lib/dashboardUtils";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  return { Authorization: `jwt ${getToken()}`, "Content-Type": "application/json" };
}

/**
 * A subtle, non-overwhelming banner that surfaces the most critical
 * forecast insight (max 1 at a time) above the dashboard metrics.
 * Users can dismiss it; it won't re-appear for the same insight type in the session.
 */
export function ForecastInsightsBanner() {
  const [insight, setInsight] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchInsight = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/cash-flow-forecast?months=1`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();

      if (!data.hasSufficientData) {
        setLoading(false);
        return;
      }

      // Priority: budget risk (high) > spending pace warning > goal risk > positive insight
      const { budgetRisks = [], goalRisks = [], insights: aiInsights = [], summary } = data;

      const highBudgetRisk = budgetRisks.find((r) => r.riskLevel === "high" && !dismissed.has(`budget_${r.budgetId}`));
      if (highBudgetRisk) {
        setInsight({
          key: `budget_${highBudgetRisk.budgetId}`,
          type: "warning",
          icon: Target,
          title: `${highBudgetRisk.categoryName} budget at risk`,
          message: `You've spent ${formatCurrency(highBudgetRisk.currentSpent)} of ${formatCurrency(highBudgetRisk.budgetAmount)} with ${highBudgetRisk.daysRemaining} days left.${
            highBudgetRisk.previousMonthSpent > 0
              ? ` Last month's total was ${formatCurrency(highBudgetRisk.previousMonthSpent)}.`
              : ""
          }`,
        });
        setLoading(false);
        return;
      }

      const paceInsight = aiInsights.find((i) => i.key === "spending_pace" && i.type === "warning" && !dismissed.has("spending_pace"));
      if (paceInsight) {
        setInsight({
          key: "spending_pace",
          type: "warning",
          icon: TrendingUp,
          title: paceInsight.title,
          message: paceInsight.message,
        });
        setLoading(false);
        return;
      }

      const goalRisk = goalRisks.find((r) => !dismissed.has(`goal_${r.goalId}`));
      if (goalRisk) {
        setInsight({
          key: `goal_${goalRisk.goalId}`,
          type: "info",
          icon: Target,
          title: `"${goalRisk.goalName}" goal may need attention`,
          message: `You need ${formatCurrency(goalRisk.requiredMonthlySavings)}/mo but are on track for ${formatCurrency(goalRisk.projectedMonthlySavings)}/mo.`,
        });
        setLoading(false);
        return;
      }

      // Positive insight
      const positive = aiInsights.find((i) => i.type === "positive" && !dismissed.has(i.key));
      if (positive) {
        setInsight({
          key: positive.key,
          type: "positive",
          icon: TrendingDown,
          title: positive.title,
          message: positive.message,
        });
      }

      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [dismissed]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  const handleDismiss = () => {
    if (insight) {
      setDismissed((prev) => new Set([...prev, insight.key]));
      setInsight(null);
    }
  };

  if (loading || !insight) return null;

  const colors = {
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      icon: "text-amber-400",
      title: "text-amber-300",
      msg: "text-amber-200/70",
      dismiss: "text-amber-400/60 hover:text-amber-300",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
      icon: "text-blue-400",
      title: "text-blue-300",
      msg: "text-blue-200/70",
      dismiss: "text-blue-400/60 hover:text-blue-300",
    },
    positive: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      icon: "text-emerald-400",
      title: "text-emerald-300",
      msg: "text-emerald-200/70",
      dismiss: "text-emerald-400/60 hover:text-emerald-300",
    },
  };

  const c = colors[insight.type] || colors.info;
  const Icon = insight.icon;

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl px-4 py-3 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300`}>
      <Icon size={16} className={`${c.icon} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${c.title}`}>{insight.title}</p>
        <p className={`text-xs ${c.msg} mt-0.5 leading-relaxed`}>{insight.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className={`${c.dismiss} transition-colors shrink-0 p-1`}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
