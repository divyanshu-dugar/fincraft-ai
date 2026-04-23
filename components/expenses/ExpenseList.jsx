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
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, ChevronLeft, ChevronRight, Repeat, SlidersHorizontal, ChevronDown, Wallet, PieChart } from "lucide-react";

import QuickBudgetSheet from "./QuickBudgetSheet";
import BulkActionsBar from "./BulkActionsBar";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

import { getToken } from "@/lib/authenticate";

import ExpenseFilters from "./ExpenseFilters";
import ExpenseTable from "./ExpenseTable";

import { ListPageSkeleton } from "@/components/skeletons/PageSkeletons";
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
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/recurring-expenses/process`, {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/expense-categories`,
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
      setSelectedIds(new Set());
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/stats`,
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
   * Delete confirmation modal state.
   */
  const [deleteTarget, setDeleteTarget] = useState(null); // expense _id to delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  /**
   * Delete an expense after user confirmation.
   */
  const deleteExpense = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/${deleteTarget}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
          },
        }
      );

      if (response.ok) {
        setExpenses((prev) => prev.filter((e) => e._id !== deleteTarget));
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(deleteTarget); return next; });
        fetchStats();
        window.dispatchEvent(new CustomEvent('expense-added')); // re-check budget alerts
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /**
   * Selection helpers for bulk operations.
   */
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (visibleExpenses) => {
    const allVisible = visibleExpenses.map((e) => e._id);
    const allSelected = allVisible.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allVisible.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...allVisible]));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  /**
   * Bulk delete selected expenses.
   */
  const bulkDelete = async () => {
    const ids = [...selectedIds];
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/bulk-delete`,
        {
          method: "POST",
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids }),
        }
      );
      if (response.ok) {
        setExpenses((prev) => prev.filter((e) => !selectedIds.has(e._id)));
        setSelectedIds(new Set());
        fetchStats();
        window.dispatchEvent(new CustomEvent('expense-added'));
      }
    } catch (error) {
      console.error("Error bulk deleting expenses:", error);
    }
  };

  /**
   * Bulk re-categorize selected expenses.
   */
  const bulkRecategorize = async (categoryId) => {
    const ids = [...selectedIds];
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/bulk-recategorize`,
        {
          method: "POST",
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids, categoryId }),
        }
      );
      if (response.ok) {
        setSelectedIds(new Set());
        fetchExpenses();
        fetchStats();
      }
    } catch (error) {
      console.error("Error bulk recategorizing:", error);
    }
  };

  /**
   * Bulk edit dates for selected expenses.
   */
  const bulkEditDate = async (date) => {
    const ids = [...selectedIds];
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/bulk-edit-date`,
        {
          method: "POST",
          headers: {
            Authorization: `${AUTH_SCHEME} ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids, date }),
        }
      );
      if (response.ok) {
        setSelectedIds(new Set());
        fetchExpenses();
        fetchStats();
      }
    } catch (error) {
      console.error("Error bulk editing dates:", error);
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

  if (loading) return <ListPageSkeleton accentFrom="from-blue-600" accentVia="via-indigo-600" accentTo="to-purple-700" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 mb-10"
        >
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white drop-shadow-2xl mb-4">
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
                className="px-8 py-4 border-2 border-white/80 text-slate-900 dark:text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <Upload size={20} />
                Import Expenses
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/expense/recurring")}
                className="px-8 py-4 border-2 border-white/80 text-slate-900 dark:text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <Repeat size={20} />
                Recurring
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/expense/analytics")}
                className="px-8 py-4 border-2 border-white/80 text-slate-900 dark:text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <PieChart size={20} />
                View Analytics
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Month / Range Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-0 z-30 overflow-hidden rounded-2xl border border-blue-400/20 mb-5"
        >
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-4 py-3 sm:px-5 sm:py-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(99,102,241,0.3),transparent_50%),radial-gradient(circle_at_90%_50%,rgba(56,189,248,0.2),transparent_45%)]" />
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">

              {/* Center: month nav + total + count */}
              <div className="text-center sm:flex-1 sm:order-2">
                {!isCustomRange ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-blue-100 hover:bg-white/25 hover:text-white transition-all"
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight min-w-[200px]">
                      {new Date(Date.UTC(currentYear, currentMonth)).toLocaleString("default", { month: "long", year: "numeric", timeZone: "UTC" })}
                    </h2>
                    <button
                      onClick={() => changeMonth(1)}
                      disabled={
                        currentYear === todayUTC.getUTCFullYear() &&
                        currentMonth === todayUTC.getUTCMonth()
                      }
                      className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-blue-100 hover:bg-white/25 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next month"
                    >
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-base sm:text-lg font-bold text-blue-100">
                    {dateRange.startDate && new Date(dateRange.startDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    {dateRange.startDate && dateRange.endDate && " – "}
                    {dateRange.endDate && new Date(dateRange.endDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                  </h2>
                )}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-sm sm:text-base font-bold text-white">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</span>
                  <span className="inline-flex items-center rounded-full bg-white/15 text-blue-50 text-[11px] font-semibold px-2.5 py-0.5 border border-white/25">
                    {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Buttons row — side by side on mobile, flanking center on desktop */}
              <div className="flex items-center justify-between gap-2 sm:contents">
                {/* Set Budget */}
                <button
                  onClick={() => setBudgetSheetOpen(true)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-blue-100 hover:bg-white/20 hover:text-white transition-all sm:order-1"
                >
                  <Wallet size={13} />
                  Set Budget
                </button>

                {/* Filters */}
                <button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 sm:order-3 ${
                    showFilters
                      ? "bg-blue-500/30 border-blue-400/60 text-blue-200"
                      : "bg-white/10 border-white/20 text-blue-100 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  Filters
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
                </button>
              </div>

            </div>
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
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />



      </div>

      <QuickBudgetSheet
        open={budgetSheetOpen}
        onClose={() => setBudgetSheetOpen(false)}
        categoryTree={categoryTree}
        onAddCategory={async (parentId, catName, color) => {
          const token = getToken();
          const body = parentId ? { name: catName, parentCategory: parentId } : { name: catName, isParent: true };
          if (color) body.color = color;
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expense-categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `${AUTH_SCHEME} ${token}` },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.error || 'Failed to create category');
          }
          fetchCategories();
        }}
        prefillAmount={expenses.reduce((s, e) => s + e.amount, 0)}
        prefillStartDate={dateRange.startDate}
        prefillEndDate={dateRange.endDate}
      />

      <ImportExpensesModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={() => {
          fetchExpenses(); // Refresh the expense list
          fetchStats(); // Refresh stats
        }}
      />

      {/* Sticky total bar — hidden when bulk selection is active */}
      {expenses.length > 0 && selectedIds.size === 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-300/60 dark:border-slate-700/60 px-6 py-3 flex items-center justify-between shadow-2xl">
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {new Date(Date.UTC(currentYear, currentMonth)).toLocaleString("default", { month: "long", year: "numeric", timeZone: "UTC" })}
            <span className="ml-2 text-slate-500">· {expenses.length} expense{expenses.length !== 1 ? "s" : ""}</span>
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</span>
        </div>
      )}

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onBulkDelete={bulkDelete}
            onBulkRecategorize={bulkRecategorize}
            onBulkEditDate={bulkEditDate}
            onClearSelection={clearSelection}
            categories={categoryTree}
          />
        )}
      </AnimatePresence>


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

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ExpenseList;
