"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Repeat, PieChart } from "lucide-react";
import { getToken } from "@/lib/authenticate";
import IncomeFilters from "./IncomeFilters";
import IncomeTable from "./IncomeTable";
import IncomeSummary from "./IncomeSummary";
import BulkActionsBar from "./BulkActionsBar";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { ListPageSkeleton } from "@/components/skeletons/PageSkeletons";

const IncomeList = () => {

  const searchParams = useSearchParams();
  const router = useRouter();
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // Read from URL params if present
  const urlStartDate = searchParams.get("startDate");
  const urlEndDate = searchParams.get("endDate");
  const urlCategory = searchParams.get("category");
  const urlMonth = searchParams.get("month");
  const urlYear = searchParams.get("year");

  const initMonth = urlMonth !== null
    ? parseInt(urlMonth, 10)
    : urlStartDate
      ? parseInt(urlStartDate.split("-")[1], 10) - 1
      : todayUTC.getUTCMonth();
  const initYear = urlYear !== null
    ? parseInt(urlYear, 10)
    : urlStartDate
      ? parseInt(urlStartDate.split("-")[0], 10)
      : todayUTC.getUTCFullYear();

  const [incomes, setIncomes] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "all");
  const [currentMonth, setCurrentMonth] = useState(initMonth);
  const [currentYear, setCurrentYear] = useState(initYear);
  const [dateRange, setDateRange] = useState({
    startDate: urlStartDate || new Date(Date.UTC(initYear, initMonth, 1)).toISOString().split("T")[0],
    endDate: urlEndDate || new Date(Date.UTC(initYear, initMonth + 1, 0)).toISOString().split("T")[0],
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🟢 Load all data when filters change
  useEffect(() => {
    fetchCategories();
    fetchIncomes();
    fetchStats();
    // Update URL params for deep-linking
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    if (dateRange.startDate) params.set("startDate", dateRange.startDate);
    if (dateRange.endDate) params.set("endDate", dateRange.endDate);
    params.set("month", currentMonth);
    params.set("year", currentYear);
    const url = `/income/list?${params.toString()}`;
    router.replace(url, { scroll: false });
  }, [selectedCategory, dateRange, currentMonth, currentYear]);

  // Process any overdue recurring incomes on first mount (fire-and-forget)
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-incomes/process`, {
      method: 'POST',
      headers: { Authorization: `jwt ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.created > 0) {
          fetchIncomes();
          fetchStats();
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🟣 Fetch user-specific categories
  const fetchCategories = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income-categories`,
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
  }, []);

  // 🟣 Fetch incomes
  const fetchIncomes = useCallback(async () => {
    try {
      const token = getToken();
      let url = "";

      // Build query parameters for date range
      const dateParams = new URLSearchParams();
      if (dateRange.startDate && dateRange.endDate) {
        dateParams.append("startDate", dateRange.startDate);
        dateParams.append("endDate", dateRange.endDate);
      }
      const dateQueryString = dateParams.toString();

      // Determine which endpoint to use
      if (selectedCategory === "all") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/income`;
        if (dateQueryString) {
          url = `${url}?${dateQueryString}`;
        }
      } else {
        if (dateQueryString) {
          url = `${process.env.NEXT_PUBLIC_API_URL}/income/category/${selectedCategory}/date-range?${dateQueryString}`;
        } else {
          url = `${process.env.NEXT_PUBLIC_API_URL}/income/category/${selectedCategory}`;
        }
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `jwt ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch incomes: ${res.status}`);
      }

      const data = await res.json();
      setIncomes(data);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error fetching incomes:", error);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedCategory]);

  // 🟣 Fetch aggregated stats
  const fetchStats = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income/stats`,
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
  }, []);

  // 🟣 Delete income (via modal)
  const deleteIncome = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income/${deleteTarget}`,
        {
          method: "DELETE",
          headers: { Authorization: `jwt ${token}` },
        }
      );

      if (res.ok) {
        setIncomes((prev) => prev.filter((e) => e._id !== deleteTarget));
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(deleteTarget); return next; });
        fetchStats();
        window.dispatchEvent(new CustomEvent('income-added'));
      }
    } catch (error) {
      console.error("Error deleting income:", error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // 🟣 Selection helpers for bulk operations
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (visibleIncomes) => {
    const allVisible = visibleIncomes.map((e) => e._id);
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

  // 🟣 Bulk operations
  const bulkDelete = async () => {
    const ids = [...selectedIds];
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income/bulk-delete`,
        {
          method: "POST",
          headers: {
            Authorization: `jwt ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids }),
        }
      );
      if (response.ok) {
        setIncomes((prev) => prev.filter((e) => !selectedIds.has(e._id)));
        setSelectedIds(new Set());
        fetchStats();
        window.dispatchEvent(new CustomEvent('income-added'));
      }
    } catch (error) {
      console.error("Error bulk deleting incomes:", error);
    }
  };

  const bulkRecategorize = async (categoryId) => {
    const ids = [...selectedIds];
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income/bulk-recategorize`,
        {
          method: "POST",
          headers: {
            Authorization: `jwt ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids, categoryId }),
        }
      );
      if (response.ok) {
        setSelectedIds(new Set());
        fetchIncomes();
        fetchStats();
      }
    } catch (error) {
      console.error("Error bulk recategorizing:", error);
    }
  };

  const bulkEditDate = async (date) => {
    const ids = [...selectedIds];
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income/bulk-edit-date`,
        {
          method: "POST",
          headers: {
            Authorization: `jwt ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids, date }),
        }
      );
      if (response.ok) {
        setSelectedIds(new Set());
        fetchIncomes();
        fetchStats();
      }
    } catch (error) {
      console.error("Error bulk editing dates:", error);
    }
  };

  // 🟣 Utility formatters
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

  // Pagination
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
    const firstDayUTC = new Date(Date.UTC(newYear, newMonth, 1));
    const lastDayUTC = new Date(Date.UTC(newYear, newMonth + 1, 0));
    setIsCustomRange(false);
    setDateRange({
      startDate: firstDayUTC.toISOString().split("T")[0],
      endDate: lastDayUTC.toISOString().split("T")[0],
    });
  };

  if (loading) return <ListPageSkeleton accentFrom="from-green-600" accentVia="via-emerald-600" accentTo="to-teal-700" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🌟 Enhanced Hero Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 mb-10"
        >
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white drop-shadow-2xl mb-4">
              Income Tracker
            </h1>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/income/add")}
                className="px-8 py-4 bg-white text-green-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:bg-green-50 flex items-center gap-2"
              >
                <Plus size={20} />
                Add New Income
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/income/recurring")}
                className="px-8 py-4 border-2 border-white/80 text-slate-900 dark:text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <Repeat size={20} />
                Recurring
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/income/analytics")}
                className="px-8 py-4 border-2 border-white/80 text-slate-900 dark:text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <PieChart size={20} />
                View Analytics
              </motion.button>
            </div>
          </div>

          {/* Enhanced decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-400/15 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </motion.header>

        {/* Filters */}

        {/* Month / Range Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-0 z-30 overflow-hidden rounded-2xl border border-emerald-400/20 mb-5"
        >
          <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 px-5 py-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_50%),radial-gradient(circle_at_90%_50%,rgba(20,184,166,0.2),transparent_45%)]" />
            <div className="relative flex items-center gap-3">

              {/* Center: month nav + total + count */}
              <div className="flex-1 text-center">
                {!isCustomRange ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-emerald-100 hover:bg-white/25 hover:text-white transition-all"
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
                      className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-emerald-100 hover:bg-white/25 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next month"
                    >
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-lg font-bold text-emerald-100">
                    {dateRange.startDate && new Date(dateRange.startDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    {dateRange.startDate && dateRange.endDate && " – "}
                    {dateRange.endDate && new Date(dateRange.endDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                  </h2>
                )}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-base font-bold text-white">{formatCurrency(incomes.reduce((s, i) => s + i.amount, 0))}</span>
                  <span className="inline-flex items-center rounded-full bg-white/15 text-emerald-50 text-[11px] font-semibold px-2.5 py-0.5 border border-white/25">
                    {incomes.length} income{incomes.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Filters — shrinks to content */}
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  showFilters
                    ? "bg-emerald-500/30 border-emerald-400/60 text-emerald-200"
                    : "bg-white/10 border-white/20 text-emerald-100 hover:bg-white/20 hover:text-white"
                }`}
              >
                <SlidersHorizontal size={13} />
                Filters
                <ChevronDown size={12} className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
              </button>

            </div>
          </div>
        </motion.div>

        {/* Collapsible Filters */}
        {showFilters && (
          <IncomeFilters
            categories={categories}
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

        {/* Enhanced Table with proper props */}
        <IncomeTable
          incomes={incomes}
          router={router}
          deleteIncome={deleteIncome}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />

        {/* Summary */}
        {incomes.length > 0 && (
          <IncomeSummary incomes={incomes} formatCurrency={formatCurrency} />
        )}
      </div>



      {/* Sticky total bar (hidden when bulk selection active) */}
      {incomes.length > 0 && selectedIds.size === 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-300/60 dark:border-slate-700/60 px-6 py-3 flex items-center justify-between shadow-2xl">
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {new Date(Date.UTC(currentYear, currentMonth)).toLocaleString("default", { month: "long", year: "numeric", timeZone: "UTC" })}
            <span className="ml-2 text-slate-500">· {incomes.length} income{incomes.length !== 1 ? "s" : ""}</span>
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(incomes.reduce((s, e) => s + e.amount, 0))}</span>
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
            categories={categories}
          />
        )}
      </AnimatePresence>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => router.push("/income/add")}
        className="fixed bottom-20 right-8 z-50 w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:shadow-emerald-500/60 transition-shadow duration-200"
        aria-label="Add income"
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      {/* Single Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default IncomeList;
