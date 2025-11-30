"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getToken } from "@/lib/authenticate";
import ExpenseFilters from "./ExpenseFilters";
import ExpenseTable from "./ExpenseTable";
import ExpenseSummary from "./ExpenseSummary";
import LoadingSpinner from "./LoadingSpinner";
//
import { Plus, Upload } from "lucide-react";
import ImportExpensesModal from "./ImportExpensesModel";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
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

  const [importModalOpen, setImportModalOpen] = useState(false);

  const router = useRouter();

  // 🟢 Load all data when filters change
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    fetchStats();
  }, [selectedCategory, dateRange]);

  // 🟣 Fetch user-specific categories
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

  // 🟣 Fetch expenses
  const fetchExpenses = async () => {
    try {
      const token = getToken();
      let url = `${process.env.NEXT_PUBLIC_API_URL}/expenses`;

      // Handle category + date filters
      if (selectedCategory !== "all") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/expenses/category/${selectedCategory}`;
      }
      if (dateRange.startDate && dateRange.endDate) {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }).toString();

        if (selectedCategory === "all") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/expenses/date-range?${params}`;
        } else {
          url = `${process.env.NEXT_PUBLIC_API_URL}/expenses/category/${selectedCategory}/date-range?${params}`;
        }
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `jwt ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch expenses");

      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟣 Fetch aggregated stats
  const fetchStats = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/stats`,
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

  // 🟣 Delete expense
  const deleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `jwt ${token}` },
        }
      );

      if (res.ok) {
        setExpenses(expenses.filter((e) => e._id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
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
      timeZone: "UTC", // 👈 Force UTC so it doesn't shift with user timezone
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
    setDateRange({
      startDate: firstDayUTC.toISOString().split("T")[0],
      endDate: lastDayUTC.toISOString().split("T")[0],
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🌟 Enhanced Hero Section */}
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

          {/* Enhanced decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/15 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </motion.header>

        {/* Filters */}
        <ExpenseFilters
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          dateRange={dateRange}
          setDateRange={setDateRange}
          router={router}
        />

        {/* Enhanced Table with proper props */}
        <ExpenseTable
          expenses={expenses}
          router={router}
          deleteExpense={deleteExpense}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        {/* Enhanced Pagination Controls */}
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
