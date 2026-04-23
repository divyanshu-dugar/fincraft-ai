"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BarChart2,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Edit2,
  Flame,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";
import { CardGridSkeleton } from "@/components/skeletons/PageSkeletons";

const API = process.env.NEXT_PUBLIC_API_URL;

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_FILTERS = [
  { key: "all",      label: "All" },
  { key: "on_track", label: "On Track",   dot: "bg-emerald-400" },
  { key: "warning",  label: "Near Limit", dot: "bg-amber-400"   },
  { key: "exceeded", label: "Exceeded",   dot: "bg-rose-400"    },
];

const STATUS_CONFIG = {
  on_track:         { label: "On Track",      color: "emerald", dot: "bg-emerald-400" },
  almost_exceeded:  { label: "Near Limit",    color: "amber",   dot: "bg-amber-400"  },
  limit_reached:    { label: "Limit Reached", color: "orange",  dot: "bg-orange-400" },
  exceeded:         { label: "Exceeded",      color: "rose",    dot: "bg-rose-400"   },
  inactive:         { label: "Inactive",      color: "gray",    dot: "bg-gray-400"   },
};

function fmt(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount ?? 0);
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function daysLeft(endDate) {
  if (!endDate) return null;
  const ms = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;
  const colors = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    amber:   "bg-amber-500/15   text-amber-400   border-amber-500/30",
    orange:  "bg-orange-500/15  text-orange-400  border-orange-500/30",
    rose:    "bg-rose-500/15    text-rose-400    border-rose-500/30",
    gray:    "bg-slate-700/50   text-slate-400   border-slate-600",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colors[cfg.color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ pct }) {
  const clamped = Math.min(pct, 100);
  const barClass =
    pct > 100 ? "bg-rose-500" :
    pct >= 100 ? "bg-orange-500" :
    pct >= 80  ? "bg-amber-500" : "bg-indigo-500";
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default function BudgetList() {
  const router = useRouter();
  const now = new Date();

  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear,  setCurrentYear]  = useState(now.getFullYear());
  const [view,         setView]         = useState("month"); // "month" | "other"
  const [statusFilter, setStatusFilter] = useState("all");
  const [budgets,      setBudgets]      = useState([]);
  const [monthStats,   setMonthStats]   = useState(null);
  const [alerts,       setAlerts]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [alertsOpen,   setAlertsOpen]   = useState(true);
  const [deleteModal,  setDeleteModal]  = useState(null); // { budget }

  // ── rollover on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetch(`${API}/api/v1/budgets/rollover`, {
        method: "POST",
        headers: { Authorization: `jwt ${token}` },
      }).catch(() => {});
    }
  }, []);

  // ── alerts ────────────────────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/v1/budgets/alerts`, { headers: { Authorization: `jwt ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.filter((a) => !a.isRead));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ── month view: weekly + monthly budgets with proportional spending ────────
  const fetchMonthData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      // Pre-create recurring budgets for future months before fetching
      const nowDate = new Date();
      const isFuture =
        currentYear > nowDate.getFullYear() ||
        (currentYear === nowDate.getFullYear() && currentMonth > nowDate.getMonth());
      if (isFuture) {
        await fetch(`${API}/api/v1/budgets/rollover-to`, {
          method: "POST",
          headers: { Authorization: `jwt ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ targetYear: currentYear, targetMonth: currentMonth }),
        }).catch(() => {});
      }
      const start = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
      const end   = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).toISOString().split("T")[0];
      const qs    = new URLSearchParams({ startDate: start, endDate: end });
      const [budgetsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/v1/budgets?${qs}`,       { headers: { Authorization: `jwt ${token}` } }),
        fetch(`${API}/api/v1/budgets/stats?${qs}`, { headers: { Authorization: `jwt ${token}` } }),
      ]);
      if (budgetsRes.ok) {
        const data = await budgetsRes.json();
        // Month view: weekly and monthly period only
        setBudgets(data.filter((b) => b.period === "monthly" || b.period === "weekly"));
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        setMonthStats(d.overallStats ?? null);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [currentMonth, currentYear]);

  // ── other view: yearly budgets (full-period spending) ────────────────────
  const fetchOtherData = useCallback(async () => {
    setLoading(true);
    setMonthStats(null);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/v1/budgets`, { headers: { Authorization: `jwt ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.filter((b) => b.period === "yearly"));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (view === "month") fetchMonthData();
    else fetchOtherData();
  }, [view, fetchMonthData, fetchOtherData]);

  // ── month navigation ──────────────────────────────────────────────────────
  function changeMonth(dir) {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setCurrentMonth(m);
    setCurrentYear(y);
  }

  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  // ── status sub-filter ─────────────────────────────────────────────────────
  const filteredBudgets = statusFilter === "all" ? budgets : budgets.filter((b) => {
    if (statusFilter === "on_track") return b.status === "on_track";
    if (statusFilter === "warning")  return b.status === "almost_exceeded" || b.status === "limit_reached";
    if (statusFilter === "exceeded") return b.status === "exceeded";
    return true;
  });

  // ── mutations ─────────────────────────────────────────────────────────────
  async function performDelete(budget, cascade) {
    try {
      const token = getToken();
      const url = cascade
        ? `${API}/api/v1/budgets/${budget._id}?cascade=true`
        : `${API}/api/v1/budgets/${budget._id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchAlerts();
        if (view === "month") fetchMonthData();
        else fetchOtherData();
      }
    } catch { /* silent */ }
  }

  async function markRead(alertId) {
    try {
      const token = getToken();
      await fetch(`${API}/api/v1/budgets/alerts/${alertId}/read`, {
        method: "PUT",
        headers: { Authorization: `jwt ${token}` },
      });
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch { /* silent */ }
  }

  async function dismissAll() {
    await Promise.all(alerts.map((a) => markRead(a._id)));
    setAlerts([]);
  }

  // ── header bar pill colour ────────────────────────────────────────────────
  const monthPct = monthStats?.overallPercentage ?? 0;
  const pillClass = monthPct > 100
    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
    : monthPct >= 80
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pb-6">

      {/* sticky page header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-300/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Target className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">Budgets</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-none mt-0.5">Track your spending limits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/budget/analytics")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200/50 dark:bg-slate-700/50 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" /> Analytics
            </button>
            <button
              onClick={() => router.push("/budget/add")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Add Budget
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── month header bar ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-100/80 dark:from-slate-800/80 via-indigo-900/30 to-slate-100 dark:to-slate-800/80 border border-indigo-500/20 shadow-sm">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/4 top-0 w-56 h-56 bg-indigo-500/5 rounded-full -translate-y-1/2" />
            <div className="absolute right-1/4 bottom-0 w-40 h-40 bg-purple-500/5 rounded-full translate-y-1/2" />
          </div>
          <div className="relative flex items-center gap-2 px-4 py-3.5">

            {/* left arrow — month view only */}
            {view === "month" ? (
              <button
                onClick={() => changeMonth(-1)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : <div className="w-7 shrink-0" />}

            {/* center */}
            <div className="flex-1 flex flex-col items-center min-w-0">
              {view === "month" ? (
                <>
                  <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </p>
                  {monthStats && !loading && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {fmt(monthStats.totalBudget)} budgeted
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {fmt(monthStats.totalSpent)} spent
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${pillClass}`}>
                        {monthPct.toFixed(0)}% used
                      </span>
                    </div>
                  )}
                  {loading && (
                    <p className="text-xs text-slate-500 mt-1">Loading…</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Yearly Budgets</p>
                  <p className="text-xs text-slate-500 mt-1">Long-running budgets spanning the full year</p>
                </>
              )}
            </div>

            {/* right side — today + right arrow */}
            <div className="shrink-0 flex items-center gap-1">
              {view === "month" && !isCurrentMonth && (
                <button
                  onClick={() => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()); }}
                  className="text-xs font-semibold text-indigo-400 px-2 py-1 rounded-lg hover:bg-indigo-500/15 transition-colors"
                >
                  Today
                </button>
              )}
              {view === "month" && (
                <button
                  onClick={() => changeMonth(1)}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {view === "other" && <div className="w-7" />}
            </div>
          </div>
        </div>

        {/* ── view switcher + status filters ────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setView("month"); setStatusFilter("all"); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              view === "month"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                : "bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-600 hover:border-slate-500 hover:text-slate-800 dark:text-slate-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => { setView("other"); setStatusFilter("all"); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              view === "other"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                : "bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-600 hover:border-slate-500 hover:text-slate-800 dark:text-slate-200"
            }`}
          >
            Yearly
          </button>

          {/* status sub-filters — monthly view only */}
          {view === "month" && (
            <>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
              {STATUS_FILTERS.map(({ key, label, dot }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    statusFilter === key
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-600 shadow-sm"
                      : "bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-500 hover:text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                  {label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* ── alert banner ──────────────────────────────────────────────────── */}
        {alerts.length > 0 && (
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-amber-500/30 shadow-sm overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setAlertsOpen((o) => !o)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setAlertsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-amber-500/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-bold text-amber-300">
                  {alerts.length} unread budget {alerts.length === 1 ? "alert" : "alerts"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); dismissAll(); }}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-amber-500/15 transition-colors"
                >
                  Dismiss all
                </button>
                {alertsOpen
                  ? <ChevronDown className="w-4 h-4 text-amber-400" />
                  : <ChevronRight className="w-4 h-4 text-amber-400" />}
              </div>
            </div>
            {alertsOpen && (
              <div className="divide-y divide-amber-500/20 border-t border-amber-500/20">
                {alerts.map((alert) => (
                  <div key={alert._id} className="flex items-center justify-between px-6 py-3 bg-amber-500/10">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.type === "budget_exceeded" ? "bg-rose-400" : "bg-amber-400"}`} />
                      <p className="text-sm text-slate-700 dark:text-slate-300">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => markRead(alert._id)}
                      className="ml-4 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── KPI cards — month view only ────────────────────────────────────── */}
        {view === "month" && monthStats && !loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Budget",  value: fmt(monthStats.totalBudget),    icon: Target,     accent: "indigo" },
              { label: "Total Spent",   value: fmt(monthStats.totalSpent),     icon: TrendingUp, accent: "rose"   },
              { label: "Remaining",     value: fmt(monthStats.totalRemaining),  icon: BadgeCheck, accent: "emerald" },
              { label: "Exceeded",      value: monthStats.exceededBudgets ?? 0, icon: Flame,      accent: "amber", unit: "budgets" },
            ].map(({ label, value, icon: Icon, accent, unit }) => {
              const accentMap = {
                indigo:  { pill: "bg-indigo-500/20",  text: "text-indigo-400" },
                rose:    { pill: "bg-rose-500/20",    text: "text-rose-400"   },
                emerald: { pill: "bg-emerald-500/20", text: "text-emerald-400" },
                amber:   { pill: "bg-amber-500/20",   text: "text-amber-400"  },
              };
              const { pill, text } = accentMap[accent];
              return (
                <div key={label} className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-sm px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className={`w-8 h-8 rounded-xl ${pill} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${text}`} />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {value}{unit ? <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">{unit}</span> : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── budget cards grid ────────────────────────────────────────────── */}
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : filteredBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
              <CircleOff className="w-7 h-7 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {view === "month"
                ? `No budgets for ${MONTH_NAMES[currentMonth]} ${currentYear}`
                : "No yearly budgets yet"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {view === "month"
                ? statusFilter !== "all"
                  ? "Try the \"All\" filter to see every budget for this month."
                  : "Add a monthly or weekly budget to track this period."
                : "Create a yearly budget to track long-term spending."}
            </p>
            <button
              onClick={() => router.push("/budget/add")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" /> Create Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBudgets.map((budget) => {
              const spent     = budget.currentSpent ?? 0;
              // Use API-computed percentage (proportional for month view) when available
              const pct       = budget.percentage ?? (budget.amount > 0 ? (spent / budget.amount) * 100 : 0);
              const remaining = budget.remaining  ?? (budget.amount - spent);
              const status    = budget.status ?? (pct > 100 ? "exceeded" : pct >= 80 ? "almost_exceeded" : "on_track");
              const days      = daysLeft(budget.endDate);
              const catName   = budget.category?.name ?? "—";
              const catIcon   = budget.category?.icon ?? "📂";

              return (
                <div
                  key={budget._id}
                  className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-md transition-all p-5 flex flex-col gap-4"
                >
                  {/* top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                        {catIcon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-base font-bold text-slate-900 dark:text-white truncate">{budget.name}</p>
                          {budget.isRecurring && (
                            <span title="Recurring budget" className="flex-shrink-0">
                              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{catName}</p>
                        <p className="text-sm font-bold text-indigo-300 mt-0.5">{fmt(budget.amount)}<span className="text-xs font-semibold text-slate-500"> / {budget.period}</span></p>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  {/* progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{Math.min(Math.round(pct), 100)}% used</span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {/* Show proportional cap for this period; if same as full amount, omit the fraction */}
                        {budget.proportionalBudget && Math.abs(budget.proportionalBudget - budget.amount) > 1
                          ? <>{fmt(budget.proportionalBudget)} <span className="text-slate-600">of {fmt(budget.amount)}</span></>
                          : fmt(budget.amount)}
                      </span>
                    </div>
                    <ProgressBar pct={pct} />
                  </div>

                  {/* amounts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-500/15 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-rose-400 font-semibold mb-0.5">Spent</p>
                      <p className="text-sm font-black text-rose-300">{fmt(spent)}</p>
                    </div>
                    <div className={`rounded-xl px-3 py-2.5 ${remaining < 0 ? "bg-rose-500/15" : "bg-emerald-500/15"}`}>
                      <p className={`text-xs font-semibold mb-0.5 ${remaining < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {remaining < 0 ? "Over" : "Remaining"}
                      </p>
                      <p className={`text-sm font-black ${remaining < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                        {fmt(Math.abs(remaining))}
                      </p>
                    </div>
                  </div>

                  {/* footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-300 dark:border-slate-700">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>{fmtDate(budget.startDate)}</span>
                      <span>→</span>
                      <span>{fmtDate(budget.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {days !== null && days <= 7 && days >= 0 && (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          {days}d left
                        </span>
                      )}
                      <button
                        onClick={() => router.push(`/budget/edit/${budget._id}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/15 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ budget })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>

    {/* ── Delete confirmation modal ─────────────────────────────────────── */}
    {deleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">Delete Budget</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{deleteModal.budget.name}</p>
            </div>
          </div>

          {deleteModal.budget.isRecurring ? (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300">This is a recurring budget. What would you like to delete?</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => performDelete(deleteModal.budget, false)}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-bold hover:bg-amber-500/30 transition-colors text-left"
                >
                  This month only
                  <p className="text-xs font-normal text-amber-400/70 mt-0.5">Other months in the series are unaffected.</p>
                </button>
                <button
                  onClick={() => performDelete(deleteModal.budget, true)}
                  className="w-full px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-bold hover:bg-rose-500/30 transition-colors text-left"
                >
                  This and all future months
                  <p className="text-xs font-normal text-rose-400/70 mt-0.5">All upcoming recurrences will be removed.</p>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300">This will permanently delete the budget. This cannot be undone.</p>
              <button
                onClick={() => performDelete(deleteModal.budget, false)}
                className="w-full px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-bold hover:bg-rose-500/30 transition-colors"
              >
                Delete budget
              </button>
            </>
          )}

          <button
            onClick={() => setDeleteModal(null)}
            className="w-full px-4 py-2 rounded-xl border border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-200/50 dark:bg-slate-700/50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    </>
  );
}
