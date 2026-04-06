"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Repeat } from "lucide-react";
import { getToken } from "@/lib/authenticate";
import IncomeFilters from "./IncomeFilters";
import IncomeTable from "./IncomeTable";
import IncomeSummary from "./IncomeSummary";
import LoadingSpinner from "./LoadingSpinner";

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const today = new Date();
  const firstDayUTC = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );
  const todayUTC = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const [dateRange, setDateRange] = useState({
    startDate: firstDayUTC.toISOString().split("T")[0],
    endDate: todayUTC.toISOString().split("T")[0],
  });

  // Pagination
  const [currentMonth, setCurrentMonth] = useState(todayUTC.getUTCMonth());
  const [currentYear, setCurrentYear] = useState(todayUTC.getUTCFullYear());
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  // 🟢 Load all data when filters change
  useEffect(() => {
    fetchCategories();
    fetchIncomes();
    fetchStats();
  }, [selectedCategory, dateRange]);

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
  const fetchCategories = async () => {
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
  };

  // 🟣 Fetch incomes
  const fetchIncomes = async () => {
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
        // Use main income endpoint with date filter
        url = `${process.env.NEXT_PUBLIC_API_URL}/income`;
        if (dateQueryString) {
          url = `${url}?${dateQueryString}`;
        }
      } else {
        // Use category-specific date range endpoint
        if (dateQueryString) {
          url = `${process.env.NEXT_PUBLIC_API_URL}/income/category/${selectedCategory}/date-range?${dateQueryString}`;
        } else {
          // If no date range, use just category endpoint
          url = `${process.env.NEXT_PUBLIC_API_URL}/income/category/${selectedCategory}`;
        }
      }

      console.log("Fetching incomes from URL:", url); // Debug log

      const res = await fetch(url, {
        headers: {
          Authorization: `jwt ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Income response not OK:", res.status, res.statusText);
        throw new Error(`Failed to fetch incomes: ${res.status}`);
      }

      const data = await res.json();
      setIncomes(data);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      // Fallback to empty array
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  // 🟣 Fetch aggregated stats
  const fetchStats = async () => {
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
  };

  // 🟣 Delete income
  const deleteIncome = async (id) => {
    if (!confirm("Are you sure you want to delete this income?")) return;
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `jwt ${token}` },
        }
      );

      if (res.ok) {
        setIncomes(incomes.filter((e) => e._id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting income:", error);
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

    // Handle year rollover
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    // Update current month/year
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // Calculate first and last day of the new month in UTC
    const firstDayUTC = new Date(Date.UTC(newYear, newMonth, 1));
    const lastDayUTC = new Date(Date.UTC(newYear, newMonth + 1, 0));

    // Update date range state
    setIsCustomRange(false);
    setDateRange({
      startDate: firstDayUTC.toISOString().split("T")[0],
      endDate: lastDayUTC.toISOString().split("T")[0],
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🌟 Enhanced Hero Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 mb-10"
        >
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-4">
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
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <Repeat size={20} />
                Recurring
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/income/analytics")}
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                📊 View Analytics
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
          className="relative overflow-hidden rounded-2xl border border-emerald-400/20 mb-5"
        >
          <div className="bg-gradient-to-r from-slate-900 via-emerald-900/60 to-teal-900/60 px-5 py-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_50%),radial-gradient(circle_at_90%_50%,rgba(20,184,166,0.2),transparent_45%)]" />
            <div className="relative flex items-center gap-3">

              {/* Spacer to balance Filters on the right */}
              <div className="shrink-0 w-[80px]" />

              {/* Center: big month + total + count */}
              <div className="flex-1 text-center">
                {!isCustomRange ? (
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {new Date(Date.UTC(currentYear, currentMonth)).toLocaleString("default", { month: "long", year: "numeric", timeZone: "UTC" })}
                  </h2>
                ) : (
                  <h2 className="text-lg font-bold text-emerald-100">
                    {dateRange.startDate && new Date(dateRange.startDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    {dateRange.startDate && dateRange.endDate && " – "}
                    {dateRange.endDate && new Date(dateRange.endDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                  </h2>
                )}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-base font-bold text-white">{formatCurrency(incomes.reduce((s, i) => s + i.amount, 0))}</span>
                  <span className="inline-flex items-center rounded-full bg-white/15 text-emerald-50 text-[11px] font-semibold px-2.5 py-0.5 border border-white/25 backdrop-blur-sm">
                    {incomes.length} income{incomes.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Filters — shrinks to content */}
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 backdrop-blur-sm ${
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
        />

        {/* Summary */}
        {incomes.length > 0 && (
          <IncomeSummary incomes={incomes} formatCurrency={formatCurrency} />
        )}
      </div>

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
    </div>
  );
};

export default IncomeList;
