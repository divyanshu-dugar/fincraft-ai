"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart2,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleOff,
  Edit2,
  Flame,
  Loader2,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_CONFIG = {
  on_track:         { label: "On Track",      color: "emerald", dot: "bg-emerald-400" },
  almost_exceeded:  { label: "Near Limit",    color: "amber",   dot: "bg-amber-400"  },
  limit_reached:    { label: "Limit Reached", color: "orange",  dot: "bg-orange-400" },
  exceeded:         { label: "Exceeded",      color: "rose",    dot: "bg-rose-400"   },
  inactive:         { label: "Inactive",      color: "gray",    dot: "bg-gray-400"   },
};

const FILTERS = [
  { key: "active",           label: "Active"        },
  { key: "almost_exceeded",  label: "Near Limit"    },
  { key: "limit_reached",    label: "Limit Reached" },
  { key: "exceeded",         label: "Exceeded"      },
  { key: "all",              label: "All"           },
];

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
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default function BudgetList() {
  const router = useRouter();
  const [budgets,      setBudgets]      = useState([]);
  const [stats,        setStats]        = useState(null);
  const [alerts,       setAlerts]       = useState([]);
  const [filter,       setFilter]       = useState("active");
  const [loading,      setLoading]      = useState(true);
  const [alertsOpen,   setAlertsOpen]   = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBudgets();
    fetchStats();
    fetchAlerts();
  }, [filter]);

  // ── data fetching ────────────────────────────────────────────────────────

  async function fetchBudgets() {
    try {
      const token = getToken();
      const res = await fetch(`${API}/budgets`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const today = new Date();

      let filtered = data;
      if (filter === "active") {
        filtered = data.filter((b) => b.isActive && today >= new Date(b.startDate) && today <= new Date(b.endDate));
      } else if (filter === "exceeded") {
        filtered = data.filter((b) => {
          const pct = ((b.currentSpent ?? 0) / b.amount) * 100;
          return pct > 100 && b.isActive && today >= new Date(b.startDate) && today <= new Date(b.endDate);
        });
      } else if (filter === "limit_reached") {
        filtered = data.filter((b) => {
          const pct = ((b.currentSpent ?? 0) / b.amount) * 100;
          return pct === 100 && b.isActive && today >= new Date(b.startDate) && today <= new Date(b.endDate);
        });
      } else if (filter === "almost_exceeded") {
        filtered = data.filter((b) => {
          const pct = ((b.currentSpent ?? 0) / b.amount) * 100;
          return pct >= 80 && pct <= 100 && b.isActive && today >= new Date(b.startDate) && today <= new Date(b.endDate);
        });
      }

      setBudgets(filtered);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const token = getToken();
      const res = await fetch(`${API}/budgets/stats`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.overallStats ?? null);
      }
    } catch { /* silent */ }
  }

  async function fetchAlerts() {
    try {
      const token = getToken();
      const res = await fetch(`${API}/budgets/alerts`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.filter((a) => !a.isRead));
      }
    } catch { /* silent */ }
  }

  async function deleteBudget(id) {
    if (!confirm("Delete this budget? This cannot be undone.")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API}/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) {
        setBudgets((prev) => prev.filter((b) => b._id !== id));
        fetchStats();
        fetchAlerts();
      }
    } catch { /* silent */ }
  }

  async function markRead(alertId) {
    try {
      const token = getToken();
      await fetch(`${API}/budgets/alerts/${alertId}/read`, {
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

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-18">

      {/* ── sticky page header ── */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Budgets</h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Track your spending limits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/budget/analytics")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-slate-400 text-xs font-semibold hover:bg-slate-700/50 transition-colors"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── KPI cards ── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Budget",  value: fmt(stats.totalBudget),   icon: Target,     accent: "indigo" },
              { label: "Total Spent",   value: fmt(stats.totalSpent),    icon: TrendingUp, accent: "rose"   },
              { label: "Remaining",     value: fmt(stats.totalRemaining), icon: BadgeCheck, accent: "emerald" },
              { label: "Exceeded",      value: stats.exceededBudgets ?? 0, icon: Flame,    accent: "amber", unit: "budgets" },
            ].map(({ label, value, icon: Icon, accent, unit }) => {
              const accentMap = {
                indigo:  { pill: "bg-indigo-500/20",  text: "text-indigo-400" },
                rose:    { pill: "bg-rose-500/20",    text: "text-rose-400"   },
                emerald: { pill: "bg-emerald-500/20", text: "text-emerald-400" },
                amber:   { pill: "bg-amber-500/20",   text: "text-amber-400"  },
              };
              const { pill, text } = accentMap[accent];
              return (
                <div key={label} className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-sm px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className={`w-8 h-8 rounded-xl ${pill} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${text}`} />
                    </div>
                  </div>
                  <p className="text-xl font-black text-white">{value}{unit ? <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span> : ''}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── alert banner ── */}
        {alerts.length > 0 && (
          <div className="bg-slate-800/60 rounded-2xl border border-amber-500/30 shadow-sm overflow-hidden">
            <button
              onClick={() => setAlertsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-amber-500/10 transition-colors"
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
                {alertsOpen ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4 text-amber-400" />}
              </div>
            </button>

            {alertsOpen && (
              <div className="divide-y divide-amber-500/20 border-t border-amber-500/20">
                {alerts.map((alert) => (
                  <div key={alert._id} className="flex items-center justify-between px-6 py-3 bg-amber-500/10">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.type === "budget_exceeded" ? "bg-rose-400" : "bg-amber-400"}`} />
                      <p className="text-sm text-slate-300">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => markRead(alert._id)}
                      className="ml-4 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── filter tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                filter === key
                  ? "bg-slate-700 text-white border-slate-600 shadow-md"
                  : "bg-slate-800/60 text-slate-400 border-slate-600 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── budget cards grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/60 rounded-2xl border border-cyan-400/20">
            <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mb-4">
              <CircleOff className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No budgets found</h3>
            <p className="text-sm text-slate-400 mb-6">
              {filter === "all" ? "Create your first budget to get started." : `No budgets match the "${FILTERS.find((f) => f.key === filter)?.label}" filter.`}
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
            {budgets.map((budget) => {
              const spent      = budget.currentSpent   ?? 0;
              const pct        = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
              const remaining  = budget.amount - spent;
              const status     = pct > 100 ? "exceeded" : pct === 100 ? "limit_reached" : pct >= 80 ? "almost_exceeded" : "on_track";
              const days       = daysLeft(budget.endDate);
              const catName    = budget.category?.name ?? "—";
              const catIcon    = budget.category?.icon ?? "📂";

              return (
                <div
                  key={budget._id}
                  className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-md transition-all p-5 flex flex-col gap-4"
                >
                  {/* top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                        {catIcon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-white truncate">{budget.name}</p>
                        <p className="text-xs text-slate-400 truncate">{catName}</p>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  {/* progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-400">{Math.round(pct)}% used</span>
                      <span className="text-xs font-semibold text-slate-400">{fmt(budget.amount)}</span>
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
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>{fmtDate(budget.startDate)}</span>
                      <span>→</span>
                      <span>{fmtDate(budget.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {days !== null && days <= 7 && (
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
                        onClick={() => deleteBudget(budget._id)}
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
  );
}
