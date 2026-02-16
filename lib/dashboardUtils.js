import {
  AlertCircle,
  Target,
  TrendingDown,
  PiggyBank,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Smartphone,
  Zap,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// ============================================
// FORMATTING UTILITIES
// ============================================

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatCurrencyDetailed = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatPercentage = (value) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ============================================
// CALCULATION UTILITIES
// ============================================

export const calculateTopIncomeCategories = (incomes) => {
  const categoryMap = {};
  incomes.forEach((income) => {
    const category = income.category?.name || "Uncategorized";
    categoryMap[category] = (categoryMap[category] || 0) + income.amount;
  });
  return Object.entries(categoryMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

export const calculateBudgetHealth = (budgetData) => {
  if (!budgetData?.budgetStats)
    return {
      total: 0,
      onTrack: 0,
      limitReached: 0,
      exceeded: 0,
      almostExceeded: 0,
    };

  const budgets = budgetData.budgetStats;
  return {
    total: budgets.length,
    onTrack: budgets.filter((b) => b.status === "on_track").length,
    limitReached: budgets.filter((b) => b.status === "limit_reached").length,
    exceeded: budgets.filter((b) => b.status === "exceeded").length,
    almostExceeded: budgets.filter((b) => b.status === "almost_exceeded")
      .length,
  };
};

export const calculateFinancialHealthScore = (
  income,
  expenses,
  netFlow,
  budgetHealth
) => {
  if (income === 0) return 0;

  const savingsRatio = netFlow / income;
  const expenseRatio = expenses / income;
  const budgetCompliance = budgetHealth.onTrack / (budgetHealth.total || 1);

  // Weighted scoring
  const score =
    (savingsRatio * 40 + (1 - expenseRatio) * 30 + budgetCompliance * 30) * 10;

  return Math.min(Math.max(score, 0), 100);
};

export const getFinancialHealthStatus = (netFlow, savingsRate) => {
  if (netFlow > 0 && savingsRate > 20) return "excellent";
  if (netFlow > 0 && savingsRate > 10) return "good";
  if (netFlow > 0) return "fair";
  return "needs_attention";
};

// ============================================
// INSIGHTS GENERATION
// ============================================

export const generateInsights = (
  expenses,
  incomes,
  budgets,
  totalExpenses,
  totalIncome,
  netCashFlow
) => {
  const insights = [];

  // Budget insights
  if (budgets?.budgetStats) {
    const exceededBudgets = budgets.budgetStats.filter(
      (b) => b.status === "exceeded"
    );
    if (exceededBudgets.length > 0) {
      insights.push({
        type: "warning",
        title: "Budget Alert",
        message: `${exceededBudgets.length} budget${
          exceededBudgets.length > 1 ? "s have" : " has"
        } been exceeded`,
        icon: AlertCircle,
      });
    }

    const limitReachedBudgets = budgets.budgetStats.filter(
      (b) => b.status === "limit_reached"
    );
    if (limitReachedBudgets.length > 0) {
      insights.push({
        type: "info",
        title: "Budget Limit Reached",
        message: `${limitReachedBudgets.length} budget${
          limitReachedBudgets.length > 1 ? "s have" : " has"
        } reached its limit`,
        icon: Target,
      });
    }
  }

  // Cash flow insights
  if (netCashFlow < 0) {
    insights.push({
      type: "warning",
      title: "Negative Cash Flow",
      message: `You're spending ${formatCurrencyDetailed(
        Math.abs(netCashFlow)
      )} more than you earn this month`,
      icon: TrendingDown,
    });
  } else if (netCashFlow > totalIncome * 0.3) {
    insights.push({
      type: "success",
      title: "Strong Savings",
      message: `You're saving ${formatCurrencyDetailed(
        netCashFlow
      )} this month (${((netCashFlow / totalIncome) * 100).toFixed(
        1
      )}% of income)`,
      icon: PiggyBank,
    });
  }

  // Spending pattern insights
  if (expenses.length > 10) {
    const avgExpense = totalExpenses / expenses.length;
    const largeExpenses = expenses.filter((e) => e.amount > avgExpense * 3);
    if (largeExpenses.length > 0) {
      insights.push({
        type: "info",
        title: "Large Expenses Detected",
        message: `${largeExpenses.length} expense${
          largeExpenses.length > 1 ? "s are" : " is"
        } significantly above average`,
        icon: CreditCard,
      });
    }
  }

  // Income insights
  if (incomes.length > 0) {
    const incomeSources = new Set(
      incomes.map((i) => i.category?.name || "Unknown")
    );
    if (incomeSources.size === 1) {
      insights.push({
        type: "info",
        title: "Single Income Source",
        message:
          "Consider diversifying your income streams for better financial stability",
        icon: DollarSign,
      });
    }
  }

  return insights.slice(0, 4);
};

// ============================================
// ICON MAPPING
// ============================================

export const getCategoryIcon = (categoryName) => {
  const icons = {
    Food: ShoppingBag,
    Restaurant: Coffee,
    Transportation: Car,
    Housing: Home,
    Entertainment: Smartphone,
    Utilities: Zap,
    Salary: DollarSign,
    Freelance: Users,
    Investment: TrendingUp,
    Bonus: Sparkles,
    Default: CreditCard,
  };

  for (const [key, icon] of Object.entries(icons)) {
    if (categoryName?.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return CreditCard;
};
