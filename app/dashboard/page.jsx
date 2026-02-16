"use client";

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
        alert("Start date must be before end date");
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
        const now = new Date();
        const start = new Date();

        // If custom dates are set, use them
        if (timeRange === "custom" && customStartDate && customEndDate) {
          return {
            startDate: customStartDate,
            endDate: customEndDate,
          };
        }

        switch (timeRange) {
          case "weekly":
            start.setDate(now.getDate() - 7);
            break;
          case "monthly":
            start.setMonth(now.getMonth() - 1);
            break;
          case "yearly":
            start.setFullYear(now.getFullYear() - 1);
            break;
          default:
            start.setMonth(now.getMonth() - 1);
        }

        return {
          startDate: start.toISOString().split("T")[0],
          endDate: now.toISOString().split("T")[0],
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

      // Calculate trends (simplified - would be based on time range)
      const expenseTrend = 12.5; // Example trend percentage
      const incomeTrend = 8.2; // Example trend percentage
      const savingsTrend = 15.3; // Example trend percentage

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 pb-20">
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
        {/* Top Metrics */}
        <MetricCards
          dashboardData={dashboardData}
          timeRange={timeRange}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Middle Section - Charts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Category Breakdown */}
          <div className="lg:col-span-2">
            <CategoryBreakdown
              dashboardData={dashboardData}
              formatCurrency={formatCurrency}
              getCategoryIcon={getCategoryIcon}
            />
          </div>

          {/* Right Column - Budget Health & AI Insights */}
          <div className="space-y-8">
            <BudgetHealth dashboardData={dashboardData} />
            <AIInsights insights={insights} />
          </div>
        </div>

        {/* Recent Transactions */}
        <RecentTransactionsTable
          dashboardData={dashboardData}
          formatCurrencyDetailed={formatCurrencyDetailed}
        />
      </div>
    </div>
  );
}
