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
import LoadingSpinner from "@/components/expenses/LoadingSpinner";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { BudgetHealth } from "@/components/dashboard/BudgetHealth";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { MonthlyBreakdown } from "@/components/dashboard/MonthlyBreakdown";
import { SectionToggler } from "@/components/dashboard/SectionToggler";
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

      // Calculate date range based on timeRange
      const getDateRange = () => {
        // If custom dates are set, use them
        if (timeRange === "custom" && customStartDate && customEndDate) {
          return {
            startDate: customStartDate,
            endDate: customEndDate,
          };
        }

        const now = new Date();
        const y = now.getUTCFullYear();
        const m = now.getUTCMonth();
        const d = now.getUTCDate();

        // Helper: format a UTC date as YYYY-MM-DD
        const fmt = (dt) => {
          const yy = dt.getUTCFullYear();
          const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(dt.getUTCDate()).padStart(2, '0');
          return `${yy}-${mm}-${dd}`;
        };

        let start, end;

        switch (timeRange) {
          case "weekly": {
            // Current week: Monday → today
            const day = now.getUTCDay(); // 0=Sun
            const diff = day === 0 ? 6 : day - 1; // days since Monday
            start = new Date(Date.UTC(y, m, d - diff));
            end = new Date(Date.UTC(y, m, d));
            break;
          }
          case "monthly": {
            // Full current calendar month: 1st → last day
            start = new Date(Date.UTC(y, m, 1));
            end = new Date(Date.UTC(y, m + 1, 0)); // last day of month
            break;
          }
          case "yearly": {
            // Current calendar year: Jan 1 → Dec 31
            start = new Date(Date.UTC(y, 0, 1));
            end = new Date(Date.UTC(y, 11, 31));
            break;
          }
          default: {
            start = new Date(Date.UTC(y, m, 1));
            end = new Date(Date.UTC(y, m + 1, 0));
          }
        }

        return {
          startDate: fmt(start),
          endDate: fmt(end),
        };
      };
      const dateRange = getDateRange();
      const queryParams = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;

      // Fetch all data with time range filter
      const [expensesRes, incomeRes, budgetRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses${queryParams}`, {
          headers: { Authorization: `jwt ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/income${queryParams}`, {
          headers: { Authorization: `jwt ${token}` },
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/budgets/stats${queryParams}`,
          {
            headers: { Authorization: `jwt ${token}` },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/expenses/stats${queryParams}`,
          {
            headers: { Authorization: `jwt ${token}` },
          }
        ),
      ]);

      const expensesData = await expensesRes.json();
      const incomeData = await incomeRes.json();
      const budgetData = await budgetRes.json();
      const statsData = await statsRes.json();

      // Calculate metrics
      const totalExpenses = expensesData.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const totalIncome = incomeData.reduce((sum, inc) => sum + inc.amount, 0);
      const netCashFlow = totalIncome - totalExpenses;
      const savingsRate =
        totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

      // Calculate real period-over-period trends
      // Split the date range in half: first half vs second half
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

      // Monthly breakdown: group income & expenses by month (use UTC to match stored dates)
      const monthlyMap = {};
      const toMonthKey = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      };
      incomeData.forEach((inc) => {
        const key = toMonthKey(inc.date);
        if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
        monthlyMap[key].income += inc.amount;
      });
      expensesData.forEach((exp) => {
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-20 py-20">
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
