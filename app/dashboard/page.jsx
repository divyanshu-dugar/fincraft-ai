'use client';

import { useState, useEffect } from "react";
import { getToken } from "@/lib/authenticate";
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  Calendar, Target, AlertCircle, ArrowUpRight, 
  ArrowDownRight, CreditCard, PiggyBank, LineChart,
  Smartphone, ShoppingBag, Car, Home, Coffee,
  Download, Filter, MoreVertical, RefreshCw,
  Users, Shield, Zap, Brain, Sparkles
} from "lucide-react";
import LoadingSpinner from "@/components/expenses/LoadingSpinner";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [dashboardData, setDashboardData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [activeMetric, setActiveMetric] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatCurrencyDetailed = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

const loadDashboardData = async () => {
  try {
    setLoading(true);
    const token = getToken();

    // Calculate date range based on timeRange
    const getDateRange = () => {
      const now = new Date();
      const start = new Date();
      
      switch (timeRange) {
        case 'weekly':
          start.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          start.setMonth(now.getMonth() - 1);
          break;
        case 'yearly':
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start.setMonth(now.getMonth() - 1);
      }
      
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/stats${queryParams}`, {
        headers: { Authorization: `jwt ${token}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/stats${queryParams}`, {
        headers: { Authorization: `jwt ${token}` },
      }),
    ]);

      const expensesData = await expensesRes.json();
      const incomeData = await incomeRes.json();
      const budgetData = await budgetRes.json();
      const statsData = await statsRes.json();

      // Calculate metrics
      const totalExpenses = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = incomeData.reduce((sum, inc) => sum + inc.amount, 0);
      const netCashFlow = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
      
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
        recentTransactions: [...expensesData.slice(0, 5), ...incomeData.slice(0, 5)]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8),
        financialHealth: {
          score: calculateFinancialHealthScore(totalIncome, totalExpenses, netCashFlow, budgetHealth),
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

  // Helper functions
  const calculateTopIncomeCategories = (incomes) => {
    const categoryMap = {};
    incomes.forEach(income => {
      const category = income.category?.name || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + income.amount;
    });
    return Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const calculateBudgetHealth = (budgetData) => {
    if (!budgetData?.budgetStats) return { total: 0, onTrack: 0, limitReached: 0, exceeded: 0, almostExceeded: 0 };
    
    const budgets = budgetData.budgetStats;
    return {
      total: budgets.length,
      onTrack: budgets.filter(b => b.status === 'on_track').length,
      limitReached: budgets.filter(b => b.status === 'limit_reached').length,
      exceeded: budgets.filter(b => b.status === 'exceeded').length,
      almostExceeded: budgets.filter(b => b.status === 'almost_exceeded').length,
    };
  };

  const calculateFinancialHealthScore = (income, expenses, netFlow, budgetHealth) => {
    if (income === 0) return 0;
    
    const savingsRatio = netFlow / income;
    const expenseRatio = expenses / income;
    const budgetCompliance = budgetHealth.onTrack / (budgetHealth.total || 1);
    
    // Weighted scoring
    const score = (
      (savingsRatio * 40) +
      ((1 - expenseRatio) * 30) +
      (budgetCompliance * 30)
    ) * 10;
    
    return Math.min(Math.max(score, 0), 100);
  };

  const getFinancialHealthStatus = (netFlow, savingsRate) => {
    if (netFlow > 0 && savingsRate > 20) return 'excellent';
    if (netFlow > 0 && savingsRate > 10) return 'good';
    if (netFlow > 0) return 'fair';
    return 'needs_attention';
  };

  const generateInsights = (expenses, incomes, budgets, totalExpenses, totalIncome, netCashFlow) => {
    const insights = [];
    
    // Budget insights
    if (budgets?.budgetStats) {
      const exceededBudgets = budgets.budgetStats.filter(b => b.status === 'exceeded');
      if (exceededBudgets.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Budget Alert',
          message: `${exceededBudgets.length} budget${exceededBudgets.length > 1 ? 's have' : ' has'} been exceeded`,
          icon: AlertCircle,
        });
      }
      
      const limitReachedBudgets = budgets.budgetStats.filter(b => b.status === 'limit_reached');
      if (limitReachedBudgets.length > 0) {
        insights.push({
          type: 'info',
          title: 'Budget Limit Reached',
          message: `${limitReachedBudgets.length} budget${limitReachedBudgets.length > 1 ? 's have' : ' has'} reached its limit`,
          icon: Target,
        });
      }
    }
    
    // Cash flow insights
    if (netCashFlow < 0) {
      insights.push({
        type: 'warning',
        title: 'Negative Cash Flow',
        message: `You're spending ${formatCurrencyDetailed(Math.abs(netCashFlow))} more than you earn this month`,
        icon: TrendingDown,
      });
    } else if (netCashFlow > totalIncome * 0.3) {
      insights.push({
        type: 'success',
        title: 'Strong Savings',
        message: `You're saving ${formatCurrencyDetailed(netCashFlow)} this month (${((netCashFlow / totalIncome) * 100).toFixed(1)}% of income)`,
        icon: PiggyBank,
      });
    }
    
    // Spending pattern insights
    if (expenses.length > 10) {
      const avgExpense = totalExpenses / expenses.length;
      const largeExpenses = expenses.filter(e => e.amount > avgExpense * 3);
      if (largeExpenses.length > 0) {
        insights.push({
          type: 'info',
          title: 'Large Expenses Detected',
          message: `${largeExpenses.length} expense${largeExpenses.length > 1 ? 's are' : ' is'} significantly above average`,
          icon: CreditCard,
        });
      }
    }
    
    // Income insights
    if (incomes.length > 0) {
      const incomeSources = new Set(incomes.map(i => i.category?.name || 'Unknown'));
      if (incomeSources.size === 1) {
        insights.push({
          type: 'info',
          title: 'Single Income Source',
          message: 'Consider diversifying your income streams for better financial stability',
          icon: DollarSign,
        });
      }
    }
    
    return insights.slice(0, 4);
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Food': ShoppingBag,
      'Restaurant': Coffee,
      'Transportation': Car,
      'Housing': Home,
      'Entertainment': Smartphone,
      'Utilities': Zap,
      'Salary': DollarSign,
      'Freelance': Users,
      'Investment': TrendingUp,
      'Bonus': Sparkles,
      'Default': CreditCard,
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (categoryName?.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return CreditCard;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fincraft Dashboard
              </h1>
              <p className="text-sm text-gray-500">Your financial command center</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                {['weekly', 'monthly', 'yearly'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Income Card */}
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl border border-emerald-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                dashboardData?.overview?.incomeTrend >= 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {dashboardData?.overview?.incomeTrend >= 0 ? (
                  <ArrowUpRight size={12} className="mr-1" />
                ) : (
                  <ArrowDownRight size={12} className="mr-1" />
                )}
                {formatPercentage(dashboardData?.overview?.incomeTrend || 0)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(dashboardData?.overview?.totalIncome || 0)}
            </h3>
            <p className="text-gray-600 text-sm">Total Income</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar size={12} className="mr-1" />
                {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                dashboardData?.overview?.expenseTrend <= 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {dashboardData?.overview?.expenseTrend <= 0 ? (
                  <ArrowDownRight size={12} className="mr-1" />
                ) : (
                  <ArrowUpRight size={12} className="mr-1" />
                )}
                {formatPercentage(dashboardData?.overview?.expenseTrend || 0)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(dashboardData?.overview?.totalExpenses || 0)}
            </h3>
            <p className="text-gray-600 text-sm">Total Expenses</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {dashboardData?.overview?.transactionCount || 0} transactions
              </div>
            </div>
          </div>

          {/* Net Cash Flow Card */}
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                dashboardData?.overview?.netCashFlow >= 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {dashboardData?.overview?.netCashFlow >= 0 ? (
                  <ArrowUpRight size={12} className="mr-1" />
                ) : (
                  <ArrowDownRight size={12} className="mr-1" />
                )}
                {formatPercentage(dashboardData?.overview?.savingsTrend || 0)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(dashboardData?.overview?.netCashFlow || 0)}
            </h3>
            <p className="text-gray-600 text-sm">Net Cash Flow</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {((dashboardData?.overview?.savingsRate || 0)).toFixed(1)}% savings rate
              </div>
            </div>
          </div>

          {/* Financial Health Score Card */}
          <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-indigo-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                {dashboardData?.financialHealth?.status?.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            <div className="flex items-end space-x-2 mb-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {Math.round(dashboardData?.financialHealth?.score || 0)}/100
              </h3>
              <span className="text-sm text-gray-500 mb-1">score</span>
            </div>
            <p className="text-gray-600 text-sm">Financial Health</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  style={{ width: `${dashboardData?.financialHealth?.score || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Charts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Category Breakdown */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Spending by Category</h2>
                  <p className="text-gray-500 text-sm">Top expense categories this period</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                {dashboardData?.categories?.expenses?.map((category, index) => {
                  const Icon = getCategoryIcon(category.name);
                  const percentage = (category.totalAmount / dashboardData.overview.totalExpenses) * 100;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.count || 1} transaction(s)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(category.totalAmount)}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {(!dashboardData?.categories?.expenses || dashboardData.categories.expenses.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <PieChart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No expense data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Budget Health & AI Insights */}
          <div className="space-y-8">
            {/* Budget Health */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Budget Health</h2>
                  <p className="text-gray-500 text-sm">{dashboardData?.budgets?.total || 0} active budgets</p>
                </div>
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              
              {dashboardData?.budgets?.total > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-700">{dashboardData.budgets.onTrack}</div>
                      <div className="text-xs text-emerald-600">On Track</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{dashboardData.budgets.limitReached}</div>
                      <div className="text-xs text-blue-600">Limit Reached</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-700">{dashboardData.budgets.almostExceeded}</div>
                      <div className="text-xs text-orange-600">Almost Exceeded</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-red-700">{dashboardData.budgets.exceeded}</div>
                      <div className="text-xs text-red-600">Exceeded</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget Compliance</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round((dashboardData.budgets.onTrack / dashboardData.budgets.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
                        style={{ width: `${(dashboardData.budgets.onTrack / dashboardData.budgets.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No active budgets</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    Create First Budget
                  </button>
                </div>
              )}
            </div>

            {/* AI Insights Panel */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">AI Insights</h2>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              
              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'success' ? 'bg-emerald-900/30 text-emerald-400' :
                          insight.type === 'warning' ? 'bg-amber-900/30 text-amber-400' :
                          'bg-blue-900/30 text-blue-400'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{insight.title}</p>
                          <p className="text-gray-300 text-xs mt-1">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {insights.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Add more data to generate insights</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <p className="text-gray-500 text-sm">Latest income and expenses</p>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View All →
            </button>
          </div>
          
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentTransactions?.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{transaction.note || 'No description'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: transaction.category?.color || '#9CA3AF' }}
                        />
                        <span className="text-sm text-gray-600">{transaction.category?.name || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.__typename === 'Income' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.__typename === 'Income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className={`font-semibold ${
                        transaction.__typename === 'Income' 
                          ? 'text-emerald-600' 
                          : 'text-gray-900'
                      }`}>
                        {transaction.__typename === 'Income' ? '+' : '-'}{formatCurrencyDetailed(transaction.amount)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LineChart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}