"use client";

import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/authenticate";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Car,
  Home,
  Coffee,
  Users,
  Zap,
  Smartphone,
  Sparkles,
  CreditCard,
} from "lucide-react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { BudgetHealth } from "@/components/dashboard/BudgetHealth";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { MonthlyBreakdown } from "@/components/dashboard/MonthlyBreakdown";
import { SectionToggler } from "@/components/dashboard/SectionToggler";
import { CashFlowForecast } from "@/components/dashboard/CashFlowForecast";
import { ForecastInsightsBanner } from "@/components/dashboard/ForecastInsightsBanner";
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatPercentage,
  formatDateForDisplay,
  calculateTopIncomeCategories,
  calculateBudgetHealth,
  calculateFinancialHealthScore,
  getFinancialHealthStatus,
  generateInsights,
  getCategoryIcon,
} from "@/lib/dashboardUtils";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");
  const [dashboardData, setDashboardData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [activeMetric, setActiveMetric] = useState("overview");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [activeSections, setActiveSections] = useState({
    categories: true,
    monthly: true,
    forecast: true,
    budgets: true,
    insights: true,
    transactions: true,
  });

  const toggleSection = (key) =>
    setActiveSections((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  // Add this useEffect to close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCustomDatePicker &&
        !event.target.closest(".custom-date-picker")
      ) {
        setShowCustomDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustomDatePicker]);

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      if (new Date(customStartDate) > new Date(customEndDate)) {
        toast.error("Start date must be before end date");
        return;
      }
      setTimeRange("custom");
      setShowCustomDatePicker(false);
    }
  };

  const handleCustomDateReset = () => {
    setCustomStartDate("");
    setCustomEndDate("");
    setTimeRange("monthly");
    setShowCustomDatePicker(false);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      // Calculate date range based on timeRange.
      //
      // All math is done in the user's LOCAL timezone (browser local time),
      // not UTC. Otherwise an ET user at 9pm on Apr 30 would see UTC=May 1
      // and the dashboard would query May (returning empty data).
      //
      // Send YYYY-MM-DD date-only strings (not ISO timestamps). The backend's
      // dateRangeFilter expands these to UTC-midnight bounds, which matches
      // how expense.date is stored (toUTCDate of the entered YYYY-MM-DD).
      //
      // Why not local-day ISO bounds? An ET user picking "Apr 1" produced
      // 2026-04-01T04:00:00Z, but the Apr 1 expense was stored at
      // 2026-04-01T00:00:00Z — so the $gte filter excluded it, dropping
      // every "1st of the month" entry for users west of UTC. Date-only
      // strings keep the calendar-day intent the user actually selected.
      //
      // We base the *which calendar day* on the user's LOCAL clock so an ET
      // user at 9pm Apr 30 still sees "April", not "May".
      const getDateRange = () => {
        const dateOnly = (y, m, d) =>
          `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        // Custom dates already arrive as YYYY-MM-DD from <input type="date">.
        if (timeRange === "custom" && customStartDate && customEndDate) {
          return { startDate: customStartDate, endDate: customEndDate };
        }

        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();

        switch (timeRange) {
          case "weekly": {
            // Current week: Monday → today (user's local week)
            const day = now.getDay(); // 0=Sun
            const diff = day === 0 ? 6 : day - 1;
            const weekStart = new Date(y, m, d - diff);
            return {
              startDate: dateOnly(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()),
              endDate: dateOnly(y, m, d),
            };
          }
          case "yearly": {
            return {
              startDate: dateOnly(y, 0, 1),
              endDate: dateOnly(y, 11, 31),
            };
          }
          case "monthly":
          default: {
            // Full current calendar month: 1st → last day (user's local month)
            const lastDay = new Date(y, m + 1, 0).getDate();
            return {
              startDate: dateOnly(y, m, 1),
              endDate: dateOnly(y, m, lastDay),
            };
          }
        }
      };
      const dateRange = getDateRange();
      const queryParams = `?startDate=${encodeURIComponent(dateRange.startDate)}&endDate=${encodeURIComponent(dateRange.endDate)}`;

      // 12-month rolling window for Monthly Breakdown — same date-only
      // contract, so the May 2025 boundary at the far end isn't dropped.
      const nowForBreakdown = new Date();
      const bY = nowForBreakdown.getFullYear();
      const bM = nowForBreakdown.getMonth();
      const breakdownStartDate = new Date(bY, bM - 11, 1);
      const breakdownEndLastDay = new Date(bY, bM + 1, 0).getDate();
      const pad = (n) => String(n).padStart(2, '0');
      const breakdownStart = `${breakdownStartDate.getFullYear()}-${pad(breakdownStartDate.getMonth() + 1)}-01`;
      const breakdownEnd = `${bY}-${pad(bM + 1)}-${pad(breakdownEndLastDay)}`;
      const breakdownParams = `?startDate=${encodeURIComponent(breakdownStart)}&endDate=${encodeURIComponent(breakdownEnd)}`;

      // Fetch all data with time range filter (+ 12-month window for breakdown)
      const [expensesRes, incomeRes, budgetRes, statsRes, breakdownExpensesRes, breakdownIncomeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses${queryParams}`, {
          headers: { Authorization: `jwt ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/income${queryParams}`, {
          headers: { Authorization: `jwt ${token}` },
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/budgets/stats${queryParams}`,
          {
            headers: { Authorization: `jwt ${token}` },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/stats${queryParams}`,
          {
            headers: { Authorization: `jwt ${token}` },
          }
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses${breakdownParams}`, {
          headers: { Authorization: `jwt ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/income${breakdownParams}`, {
          headers: { Authorization: `jwt ${token}` },
        }),
      ]);

      const expensesData = await expensesRes.json();
      const incomeData = await incomeRes.json();
      const budgetData = await budgetRes.json();
      const statsData = await statsRes.json();
      const breakdownExpensesData = await breakdownExpensesRes.json();
      const breakdownIncomeData = await breakdownIncomeRes.json();

      // Calculate metrics
      const totalExpenses = expensesData.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const totalIncome = incomeData.reduce((sum, inc) => sum + inc.amount, 0);
      const netCashFlow = totalIncome - totalExpenses;
      const savingsRate =
        totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

      // Calculate real period-over-period trends.
      // dateRange.{startDate,endDate} are now full ISO timestamps (local-day
      // boundaries serialized as UTC), so new Date() parses them correctly.
      const rangeStart = new Date(dateRange.startDate);
      const rangeEnd = new Date(dateRange.endDate);
      const midpoint = new Date((rangeStart.getTime() + rangeEnd.getTime()) / 2);

      const firstHalfExpenses = expensesData
        .filter(e => new Date(e.date) < midpoint)
        .reduce((s, e) => s + e.amount, 0);
      const secondHalfExpenses = expensesData
        .filter(e => new Date(e.date) >= midpoint)
        .reduce((s, e) => s + e.amount, 0);
      const firstHalfIncome = incomeData
        .filter(i => new Date(i.date) < midpoint)
        .reduce((s, i) => s + i.amount, 0);
      const secondHalfIncome = incomeData
        .filter(i => new Date(i.date) >= midpoint)
        .reduce((s, i) => s + i.amount, 0);

      const calcTrend = (prev, curr) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

      const expenseTrend = calcTrend(firstHalfExpenses, secondHalfExpenses);
      const incomeTrend = calcTrend(firstHalfIncome, secondHalfIncome);
      const firstHalfSavings = firstHalfIncome - firstHalfExpenses;
      const secondHalfSavings = secondHalfIncome - secondHalfExpenses;
      const savingsTrend = calcTrend(Math.abs(firstHalfSavings) || 1, secondHalfSavings);

      // Generate insights
      const generatedInsights = generateInsights(
        expensesData,
        incomeData,
        budgetData,
        totalExpenses,
        totalIncome,
        netCashFlow
      );

      // Top categories
      const topExpenseCategories = statsData?.categoryStats?.slice(0, 5) || [];
      const topIncomeCategories = calculateTopIncomeCategories(incomeData);

      // Budget health
      const budgetHealth = calculateBudgetHealth(budgetData);

      // Monthly breakdown: group income & expenses by month over the last 12
      // months so the section shows real month-on-month trends regardless of
      // the currently selected time range. Pre-seeds every month in the
      // window so gaps render as zero rows instead of disappearing.
      const monthlyMap = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(Date.UTC(bY, bM - i, 1));
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = { income: 0, expense: 0 };
      }
      const toMonthKey = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      };
      (Array.isArray(breakdownIncomeData) ? breakdownIncomeData : []).forEach((inc) => {
        const key = toMonthKey(inc.date);
        if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
        monthlyMap[key].income += inc.amount;
      });
      (Array.isArray(breakdownExpensesData) ? breakdownExpensesData : []).forEach((exp) => {
        const key = toMonthKey(exp.date);
        if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
        monthlyMap[key].expense += exp.amount;
      });
      const monthlyBreakdown = Object.entries(monthlyMap)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, data]) => ({
          month,
          income: data.income,
          expense: data.expense,
          variance: data.income - data.expense,
        }));

      setDashboardData({
        overview: {
          totalExpenses,
          totalIncome,
          netCashFlow,
          savingsRate,
          expenseTrend,
          incomeTrend,
          savingsTrend,
          transactionCount: expensesData.length + incomeData.length,
          averageTransaction: totalExpenses / (expensesData.length || 1),
        },
        categories: {
          expenses: topExpenseCategories,
          income: topIncomeCategories,
        },
        budgets: budgetHealth,
        monthlyBreakdown,
        recentTransactions: [
          ...expensesData.slice(0, 5),
          ...incomeData.slice(0, 5),
        ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8),
        financialHealth: {
          score: calculateFinancialHealthScore(
            totalIncome,
            totalExpenses,
            netCashFlow,
            budgetHealth
          ),
          status: getFinancialHealthStatus(netCashFlow, savingsRate),
        },
      });

      setInsights(generatedInsights);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pb-20">
      {/* Header */}
      <DashboardHeader
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        loadDashboardData={loadDashboardData}
        showCustomDatePicker={showCustomDatePicker}
        setShowCustomDatePicker={setShowCustomDatePicker}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        handleCustomDateApply={handleCustomDateApply}
        handleCustomDateReset={handleCustomDateReset}
        formatDateForDisplay={formatDateForDisplay}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Forecast Insights Banner — subtle, dismissable */}
        <ForecastInsightsBanner />

        {/* Top Metrics — always visible */}
        <MetricCards
          dashboardData={dashboardData}
          timeRange={timeRange}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />

        {/* Quick Actions + Links */}
        <QuickActions />

        {/* Section Toggler */}
        <SectionToggler
          activeSections={activeSections}
          toggleSection={toggleSection}
        />

        {/* Toggleable sections */}
        {activeSections.categories && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Category Breakdown takes 2/3 */}
            <div className="lg:col-span-2">
              <CategoryBreakdown
                dashboardData={dashboardData}
                formatCurrency={formatCurrency}
                getCategoryIcon={getCategoryIcon}
              />
            </div>

            {/* Budget Health + AI Insights stacked in 1/3 if their toggles are also on */}
            <div className="space-y-8">
              {activeSections.budgets && (
                <BudgetHealth dashboardData={dashboardData} />
              )}
              {activeSections.insights && (
                <AIInsights insights={insights} />
              )}
              {/* If both budgets & insights are off but categories is on, show a placeholder */}
              {!activeSections.budgets && !activeSections.insights && (
                <div />
              )}
            </div>
          </div>
        )}

        {/* If categories is off but budgets/insights are on, render them in a 2-col row */}
        {!activeSections.categories && (activeSections.budgets || activeSections.insights) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {activeSections.budgets && <BudgetHealth dashboardData={dashboardData} />}
            {activeSections.insights && <AIInsights insights={insights} />}
          </div>
        )}

        {/* Monthly Breakdown */}
        {activeSections.monthly && (
          <div className="mb-8">
            <MonthlyBreakdown
              dashboardData={dashboardData}
              formatCurrency={formatCurrency}
            />
          </div>
        )}

        {/* Cash Flow Forecast */}
        {activeSections.forecast && (
          <div className="mb-8">
            <CashFlowForecast />
          </div>
        )}

        {/* Recent Transactions */}
        {activeSections.transactions && (
          <RecentTransactionsTable
            dashboardData={dashboardData}
            formatCurrencyDetailed={formatCurrencyDetailed}
          />
        )}
      </div>
    </div>
  );
}
