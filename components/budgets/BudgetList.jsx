"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { getToken } from "@/lib/authenticate";
import BudgetFilters from "./BudgetFilters";
import BudgetTable from "./BudgetTable";
import BudgetStats from "./BudgetStats";
import LoadingSpinner from "./LoadingSpinner";

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // all, active, exceeded, almost_exceeded

  const router = useRouter();

  // Load all data
  useEffect(() => {
    fetchCategories();
    fetchBudgets();
    fetchStats();
    fetchAlerts();
  }, [filter]);

  // Fetch expense categories for budget creation
  const fetchCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expense-categories`,
        {
          headers: {
            Authorization: `jwt ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets`, {
        headers: {
          Authorization: `jwt ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch budgets");

      const data = await res.json();

      // Add current date for filtering
      const today = new Date();

      // Apply filters
      let filteredData = data;

      if (filter === "active") {
        filteredData = data.filter((budget) => {
          // Budget is active AND current date is within budget period
          const isActive = budget.isActive;
          const startDate = new Date(budget.startDate);
          const endDate = new Date(budget.endDate);
          const isCurrent = today >= startDate && today <= endDate;
          return isActive && isCurrent;
        });
      } else if (filter === "exceeded") {
        filteredData = data.filter((budget) => {
          const currentSpent = budget.currentSpent || 0;
          const percentage = (currentSpent / budget.amount) * 100;
          const startDate = new Date(budget.startDate);
          const endDate = new Date(budget.endDate);
          const isCurrent = today >= startDate && today <= endDate;
          return percentage > 100 && isCurrent && budget.isActive; // Changed from >= 100 to > 100
        });
      } else if (filter === "limit_reached") {
        filteredData = data.filter((budget) => {
          const currentSpent = budget.currentSpent || 0;
          const percentage = (currentSpent / budget.amount) * 100;
          const startDate = new Date(budget.startDate);
          const endDate = new Date(budget.endDate);
          const isCurrent = today >= startDate && today <= endDate;
          return percentage === 100 && isCurrent && budget.isActive;
        });
      } else if (filter === "almost_exceeded") {
        filteredData = data.filter((budget) => {
          const currentSpent = budget.currentSpent || 0;
          const percentage = (currentSpent / budget.amount) * 100;
          const startDate = new Date(budget.startDate);
          const endDate = new Date(budget.endDate);
          const isCurrent = today >= startDate && today <= endDate;
          return (
            percentage >= 80 &&
            percentage <= 100 &&
            isCurrent &&
            budget.isActive
          ); // Changed from < 100 to <= 100
        });
      }

      setBudgets(filteredData);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch budget stats
  const fetchStats = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets/stats`,
        {
          headers: { Authorization: `jwt ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets/alerts`,
        {
          headers: { Authorization: `jwt ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAlerts(data.filter((alert) => !alert.isRead));
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  // Delete budget
  const deleteBudget = async (id) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `jwt ${token}` },
        }
      );

      if (res.ok) {
        setBudgets(budgets.filter((b) => b._id !== id));
        fetchStats();
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId) => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets/alerts/${alertId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `jwt ${token}` },
        }
      );

      if (res.ok) {
        setAlerts(alerts.filter((alert) => alert._id !== alertId));
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  // Utility formatters
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🌟 Enhanced Hero Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-3xl shadow-2xl p-8 mb-10"
        >
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-4">
              Budget Tracker
            </h1>
            <p className="text-xl md:text-2xl text-purple-100/90 max-w-2xl mb-8 leading-relaxed">
              Take control of your spending. Set budgets, track progress, and
              get smart alerts to stay on track financially.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/budget/add")}
                className="px-8 py-4 bg-white text-purple-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:bg-purple-50 flex items-center gap-2"
              >
                <Plus size={20} />
                Create New Budget
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/expense/list")}
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                💰 Track Expenses
              </motion.button>
            </div>
          </div>

          {/* Enhanced decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/15 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </motion.header>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Budget Alerts ({alerts.length})
                </h3>
                <button
                  onClick={() => setAlerts([])}
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  Dismiss All
                </button>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          alert.type === "budget_exceeded"
                            ? "bg-red-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <p className="text-sm text-gray-700">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => markAlertAsRead(alert._id)}
                      className="text-xs text-orange-600 hover:text-orange-800 px-2 py-1 rounded"
                    >
                      Mark Read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {stats && <BudgetStats stats={stats} formatCurrency={formatCurrency} />}

        {/* Filters */}
        <BudgetFilters
          filter={filter}
          setFilter={setFilter}
          budgetsCount={budgets.length}
        />

        {/* Budget Table */}
        <BudgetTable
          budgets={budgets}
          router={router}
          deleteBudget={deleteBudget}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        {/* Empty State */}
        {budgets.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl text-center py-20 border border-gray-200/60"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                No budgets yet
              </h3>
              <p className="text-gray-500 text-lg mb-8">
                Start managing your finances by creating your first budget.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/budget/add")}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Create Your First Budget
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;
