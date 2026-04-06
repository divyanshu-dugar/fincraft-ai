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

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Upload, ChevronLeft, ChevronRight, Repeat, SlidersHorizontal, ChevronDown } from "lucide-react";

import { getToken } from "@/lib/authenticate";

import ExpenseFilters from "./ExpenseFilters";
import ExpenseTable from "./ExpenseTable";

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
  const [categoryTree, setCategoryTree] = useState([]);
  const categoryTreeRef = useRef([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);

  /**
   * ================================
   * Date & Pagination State (UTC-based)
   * ================================
   * UTC is enforced to avoid timezone-related date shifting issues
   * between frontend and backend.
   */
  const searchParams = useSearchParams();

  const todayUTC = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );

  const urlStartDate = searchParams.get("startDate");
  const urlEndDate = searchParams.get("endDate");
  const urlCategory = searchParams.get("category");

  const initMonth = searchParams.get("month") !== null
    ? parseInt(searchParams.get("month"), 10)
    : urlStartDate
      ? parseInt(urlStartDate.split("-")[1], 10) - 1
      : todayUTC.getUTCMonth();
  const initYear = searchParams.get("year") !== null
    ? parseInt(searchParams.get("year"), 10)
    : urlStartDate
      ? parseInt(urlStartDate.split("-")[0], 10)
      : todayUTC.getUTCFullYear();

  const [selectedCategory, setSelectedCategory] = useState(urlCategory || DEFAULT_CATEGORY);
  const [currentMonth, setCurrentMonth] = useState(initMonth);
  const [currentYear, setCurrentYear] = useState(initYear);

  const [dateRange, setDateRange] = useState({
    startDate: urlStartDate || new Date(Date.UTC(initYear, initMonth, 1)).toISOString().split("T")[0],
    endDate: urlEndDate || new Date(Date.UTC(initYear, initMonth + 1, 0)).toISOString().split("T")[0],
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  // Process any overdue recurring expenses on first mount (fire-and-forget)
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-expenses/process`, {
      method: 'POST',
      headers: { Authorization: `jwt ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.created > 0) {
          // New entries were generated — refresh the list
          fetchExpenses();
          fetchStats();
        }
      })
      .catch(() => {/* silent */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const tree = data.tree || [];
      setCategoryTree(tree);
      categoryTreeRef.current = tree;
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined. Restart the dev server.");
      }

      const response = await fetch(
        `${apiUrl}/expenses?${params.toString()}`,
        {
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch expenses (${response.status} ${response.statusText}) from ${apiUrl}/expenses`);
      }

      const allExpenses = await response.json();

      // Apply category filter on frontend if a specific category is selected
      const filteredExpenses =
        selectedCategory === DEFAULT_CATEGORY
          ? allExpenses
          : selectedCategory.startsWith("parent:")
            ? (() => {
                const parentId = selectedCategory.slice(7);
                const parent = categoryTreeRef.current.find((p) => p._id === parentId);
                const subIds = new Set((parent?.subcategories || []).map((s) => s._id));
                return allExpenses.filter((expense) => subIds.has(expense.category?._id));
              })()
            : allExpenses.filter((expense) => expense.category?._id === selectedCategory);

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

    setIsCustomRange(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-18">
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
                onClick={() => router.push("/expense/recurring")}
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <Repeat size={20} />
                Recurring
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/expense/analytics")}
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                📊 View Analytics
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Month / Range Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 items-center bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 px-5 py-4 mb-5"
        >
          <div />
          <div className="text-center">
            {!isCustomRange ? (
              <h2 className="text-xl font-bold text-white">
                {new Date(Date.UTC(currentYear, currentMonth)).toLocaleString("default", { month: "long", year: "numeric", timeZone: "UTC" })}
              </h2>
            ) : (
              <h2 className="text-base font-semibold text-slate-300">
                {dateRange.startDate && new Date(dateRange.startDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                {dateRange.startDate && dateRange.endDate && " – "}
                {dateRange.endDate && new Date(dateRange.endDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </h2>
            )}
            <p className="text-slate-400 text-sm mt-0.5">
              <span className="text-white font-semibold">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</span>
              <span className="ml-2">· {expenses.length} expense{expenses.length !== 1 ? "s" : ""}</span>
            </p>
          </div>
          <div className="flex justify-end">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
              showFilters
                ? "bg-blue-500/20 border-blue-400/60 text-blue-300"
                : "bg-slate-700/60 border-slate-600/60 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
          </button>
          </div>
        </motion.div>

        {/* Collapsible Filters */}
        {showFilters && (
          <ExpenseFilters
            categories={categoryTree}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            dateRange={dateRange}
            setDateRange={setDateRange}
            router={router}
            onCustomRangeApply={() => setIsCustomRange(true)}
            onCustomRangeReset={() => {
              setIsCustomRange(false);
              const t = new Date();
              const m = t.getUTCMonth();
              const y = t.getUTCFullYear();
              setCurrentMonth(m);
              setCurrentYear(y);
              setDateRange({
                startDate: new Date(Date.UTC(y, m, 1)).toISOString().split("T")[0],
                endDate: new Date(Date.UTC(y, m + 1, 0)).toISOString().split("T")[0],
              });
            }}
          />
        )}

        <ExpenseTable
          expenses={expenses}
          router={router}
          deleteExpense={deleteExpense}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />



      </div>

      <ImportExpensesModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={() => {
          fetchExpenses(); // Refresh the expense list
          fetchStats(); // Refresh stats
        }}
      />

      {/* Sticky total bar */}
      {expenses.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/60 px-6 py-3 flex items-center justify-between shadow-2xl">
          <span className="text-sm text-slate-400 font-medium">
            {new Date(Date.UTC(currentYear, currentMonth)).toLocaleString("default", { month: "long", year: "numeric", timeZone: "UTC" })}
            <span className="ml-2 text-slate-500">· {expenses.length} expense{expenses.length !== 1 ? "s" : ""}</span>
          </span>
          <span className="text-lg font-black text-white">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</span>
        </div>
      )}

      {/* Floating month nav arrows */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => changeMonth(-1)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 bg-slate-800/80 backdrop-blur-sm border border-slate-600/60 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full shadow-xl flex items-center justify-center transition-colors duration-200"
        aria-label="Previous month"
      >
        <ChevronLeft size={22} strokeWidth={2.5} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => changeMonth(1)}
        disabled={
          currentYear === todayUTC.getUTCFullYear() &&
          currentMonth === todayUTC.getUTCMonth()
        }
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 bg-slate-800/80 backdrop-blur-sm border border-slate-600/60 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full shadow-xl flex items-center justify-center transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next month"
      >
        <ChevronRight size={22} strokeWidth={2.5} />
      </motion.button>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => router.push("/expense/add")}
        className="fixed bottom-20 right-8 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:shadow-blue-500/60 transition-shadow duration-200"
        aria-label="Add expense"
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};

export default ExpenseList;
