"use client";

/**
 * @file ExpenseList.jsx
 * @description
 * Client-side container component responsible for displaying,
 * filtering, paginating, and managing user expenses.
 *
 * This component orchestrates data fetching and UI state while
 * delegating rendering responsibilities to child components.
 *
 * @author Divyanshu Dugar
 * @project FinCraft AI
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Upload } from "lucide-react";

import { getToken } from "@/lib/authenticate";

import ExpenseFilters from "./ExpenseFilters";
import ExpenseTable from "./ExpenseTable";
import ExpenseSummary from "./ExpenseSummary";
import LoadingSpinner from "./LoadingSpinner";
import ImportExpensesModal from "./ImportExpensesModel";

/**
 * Constants used throughout the component to avoid magic strings.
 */
const DEFAULT_CATEGORY = "all";
const CURRENCY_CODE = "USD";
const AUTH_SCHEME = "jwt";

const ExpenseList = () => {
  /**
   * ================================
   * Component State
   * ================================
   */
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [importModalOpen, setImportModalOpen] = useState(false);

  /**
   * ================================
   * Date & Pagination State (UTC-based)
   * ================================
   * UTC is enforced to avoid timezone-related date shifting issues
   * between frontend and backend.
   */
  const todayUTC = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );

  const [currentMonth, setCurrentMonth] = useState(todayUTC.getUTCMonth());
  const [currentYear, setCurrentYear] = useState(todayUTC.getUTCFullYear());

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.UTC(currentYear, currentMonth, 1))
      .toISOString()
      .split("T")[0],
    endDate: todayUTC.toISOString().split("T")[0],
  });

  const router = useRouter();

  /**
   * ================================
   * Data Fetching Effects
   * ================================
   * Refetch expenses and stats whenever filters change.
   */
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    fetchStats();
  }, [selectedCategory, dateRange]);

  /**
   * ================================
   * API Calls
   * ================================
   */

  /**
   * Fetch all expense categories for the authenticated user.
   */
  const fetchCategories = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expense-categories`,
        {
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expense categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  /**
   * Fetch expenses within the selected date range.
   * Category filtering is applied on the frontend for simplicity.
   */
  const fetchExpenses = useCallback(async () => {
    setLoading(true);

    try {
      const token = getToken();
      const params = new URLSearchParams();

      if (dateRange.startDate && dateRange.endDate) {
        params.append("startDate", dateRange.startDate);
        params.append("endDate", dateRange.endDate);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses?${params.toString()}`,
        {
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const allExpenses = await response.json();

      // Apply category filter on frontend if a specific category is selected
      const filteredExpenses =
        selectedCategory === DEFAULT_CATEGORY
          ? allExpenses
          : allExpenses.filter(
              (expense) =>
                expense.category?._id === selectedCategory ||
                expense.category?.name === selectedCategory
            );

      setExpenses(filteredExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedCategory]);

  /**
   * Fetch aggregated expense statistics for analytics display.
   */
  const fetchStats = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/stats`,
        {
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching expense stats:", error);
    }
  }, []);

  /**
   * ================================
   * Mutations
   * ================================
   */

  /**
   * Delete an expense after user confirmation.
   */
  const deleteExpense = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmed) return;

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
          },
        }
      );

      if (response.ok) {
        setExpenses((prev) => prev.filter((e) => e._id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  /**
   * ================================
   * Utility Functions
   * ================================
   */

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CURRENCY_CODE,
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  /**
   * Handle month-based pagination.
   */
  const changeMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    const firstDay = new Date(Date.UTC(newYear, newMonth, 1));
    const lastDay = new Date(Date.UTC(newYear, newMonth + 1, 0));

    setDateRange({
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    });
  };

  /**
   * ================================
   * Render
   * ================================
   */

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 mb-10"
        >
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-4">
              Expense Tracker
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/90 max-w-2xl mb-8 leading-relaxed">
              Take control of your financial journey. Track, analyze, and
              optimize your spending with intelligent insights.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/expense/add")}
                className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:bg-blue-50 flex items-center gap-2"
              >
                <Plus size={20} />
                Add New Expense
              </motion.button>

              {/* Add Import Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setImportModalOpen(true)}
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <Upload size={20} />
                Import Expenses
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/reports")}
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                📊 View Analytics
              </motion.button>
            </div>
          </div>
        </motion.header>

        <ExpenseFilters
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          dateRange={dateRange}
          setDateRange={setDateRange}
          router={router}
        />

        <ExpenseTable
          expenses={expenses}
          router={router}
          deleteExpense={deleteExpense}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200/60"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => changeMonth(-1)}
            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            ← Previous Month
          </motion.button>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {new Date(Date.UTC(currentYear, currentMonth)).toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {expenses.length} expenses this period
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => changeMonth(1)}
            disabled={
              currentYear === todayUTC.getUTCFullYear() &&
              currentMonth === todayUTC.getUTCMonth()
            }
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            Next Month →
          </motion.button>
        </motion.div>

        {/* Summary */}
        {expenses.length > 0 && (
          <ExpenseSummary expenses={expenses} formatCurrency={formatCurrency} />
        )}
      </div>

      <ImportExpensesModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={() => {
          fetchExpenses(); // Refresh the expense list
          fetchStats(); // Refresh stats
        }}
      />
    </div>
  );
};

export default ExpenseList;
