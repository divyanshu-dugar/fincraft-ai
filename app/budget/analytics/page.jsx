"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── utilities ────────────────────────────────────────────────────────────────

function money(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function moneyExact(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v || 0);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtRelative(d) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function toDateInput(date) {
  return date.toISOString().split("T")[0];
}

function defaultRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
}

const STATUS_CONFIG = {
  on_track:        { label: "On Track",        color: "text-emerald-700", bg: "bg-emerald-100", bar: "#10b981", dot: "bg-emerald-500" },
  almost_exceeded: { label: "Near Limit",      color: "text-amber-700",   bg: "bg-amber-100",   bar: "#f59e0b", dot: "bg-amber-500"   },
  limit_reached:   { label: "Limit Reached",   color: "text-orange-700",  bg: "bg-orange-100",  bar: "#f97316", dot: "bg-orange-500"  },
  exceeded:        { label: "Exceeded",         color: "text-red-700",     bg: "bg-red-100",     bar: "#ef4444", dot: "bg-red-500"     },
};

const ALERT_TYPE_CONFIG = {
  threshold_reached:      { label: "Threshold Reached",  icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  budget_almost_exceeded: { label: "Near Limit",         icon: AlertTriangle, color: "text-orange-600",bg: "bg-orange-50",border: "border-orange-200" },
  budget_exceeded:        { label: "Budget Exceeded",    icon: ShieldAlert,   color: "text-red-600",   bg: "bg-red-50",   border: "border-red-200"   },
  budget_limit_reached:   { label: "Limit Reached",      icon: ShieldAlert,   color: "text-orange-600",bg: "bg-orange-50",border: "border-orange-200"},
};

const RANGE_PRESETS = [
  { label: "This Month",  getRange: () => { const n = new Date(); return { startDate: toDateInput(new Date(n.getFullYear(), n.getMonth(), 1)), endDate: toDateInput(new Date(n.getFullYear(), n.getMonth() + 1, 0)) }; } },
  { label: "Last Month",  getRange: () => { const n = new Date(); return { startDate: toDateInput(new Date(n.getFullYear(), n.getMonth() - 1, 1)), endDate: toDateInput(new Date(n.getFullYear(), n.getMonth(), 0)) }; } },
  { label: "Last 3 Mo",   getRange: () => { const n = new Date(); return { startDate: toDateInput(new Date(n.getFullYear(), n.getMonth() - 2, 1)), endDate: toDateInput(new Date(n.getFullYear(), n.getMonth() + 1, 0)) }; } },
  { label: "This Year",   getRange: () => { const n = new Date(); return { startDate: toDateInput(new Date(n.getFullYear(), 0, 1)), endDate: toDateInput(new Date(n.getFullYear(), 11, 31)) }; } },
];

// ── skeleton pieces ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="w-20 h-5 bg-gray-100 rounded-full" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-28 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-36 mb-1" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-72 mb-8" />
      <div className="h-[320px] bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl" />
    </div>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────

const TONES = {
  blue:    { bg: "from-white to-blue-50/40",    border: "border-blue-100/60",    icon: "bg-blue-100 text-blue-600"    },
  emerald: { bg: "from-white to-emerald-50/40", border: "border-emerald-100/60", icon: "bg-emerald-100 text-emerald-600" },
  rose:    { bg: "from-white to-rose-50/40",    border: "border-rose-100/60",    icon: "bg-rose-100 text-rose-600"    },
  amber:   { bg: "from-white to-amber-50/40",   border: "border-amber-100/60",   icon: "bg-amber-100 text-amber-600"  },
  purple:  { bg: "from-white to-purple-50/40",  border: "border-purple-100/60",  icon: "bg-purple-100 text-purple-600" },
  indigo:  { bg: "from-white to-indigo-50/40",  border: "border-indigo-100/60",  icon: "bg-indigo-100 text-indigo-600" },
};

function KPICard({ icon: Icon, label, value, sub, tone = "blue", badge, badgeTone }) {
  const t = TONES[tone] || TONES.blue;
  const badgeColors = badgeTone === "rose" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700";
  return (
    <div className={`bg-gradient-to-br ${t.bg} rounded-2xl border ${t.border} p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${t.icon} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge !== undefined && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors}`}>{badge}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-tight truncate">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── custom recharts tooltips ──────────────────────────────────────────────────

function BudgetBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl p-4 min-w-[200px]">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 truncate">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill || item.color }} />
              <span className="text-sm text-gray-600 truncate">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{moneyExact(item.value)}</span>
          </div>
        ))}
      </div>
      {payload.length >= 2 && payload[0] && payload[1] && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Burn Rate</span>
            <span className={`text-xs font-bold ${
              payload[1].value > payload[0].value ? "text-red-600" : "text-emerald-600"
            }`}>
              {payload[0].value > 0 ? `${Math.min((payload[1].value / payload[0].value) * 100, 999).toFixed(0)}%` : "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function BurnRateTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const pct = payload[0]?.value ?? 0;
  const cfg = pct > 100 ? STATUS_CONFIG.exceeded : pct >= 80 ? STATUS_CONFIG.almost_exceeded : STATUS_CONFIG.on_track;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl p-4 min-w-[180px]">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 truncate">{label}</p>
      <p className={`text-2xl font-bold ${cfg.color}`}>{pct.toFixed(1)}%</p>
      <p className={`text-xs font-semibold mt-1 ${cfg.color}`}>{cfg.label}</p>
    </div>
  );
}

// ── sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
    : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />;
}

// ── axis tick formatters (stable refs) ────────────────────────────────────────

function yTickMoney(v) { return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`; }
function yTickPct(v)   { return `${v}%`; }

// ─────────────────────────────────────────────────────────────────────────────

export default function BudgetAnalyticsPage() {
  const [range, setRange]           = useState(defaultRange);
  const [stats, setStats]           = useState(null);
  const [alerts, setAlerts]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [error, setError]           = useState("");
  const [sortKey, setSortKey]       = useState("percentage");
  const [sortDir, setSortDir]       = useState("desc");
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAllBudgets, setShowAllBudgets] = useState(false);
  const [activePreset, setActivePreset]  = useState("This Month");

  const isFirstLoad  = loading && !stats;
  const isRefreshing = loading && !!stats;

  // ── computed ────────────────────────────────────────────────────────────────

  const budgetRows = useMemo(() => stats?.budgetStats ?? [], [stats]);

  const sortedRows = useMemo(() => {
    return [...budgetRows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return typeof aVal === "string" ? aVal.localeCompare(bVal) * dir : (aVal - bVal) * dir;
    });
  }, [budgetRows, sortKey, sortDir]);

  const displayedRows = showAllBudgets ? sortedRows : sortedRows.slice(0, 10);

  // Chart data: grouped bar — Budget vs Spent per category
  const spendingChartData = useMemo(() => {
    return budgetRows.map((b) => ({
      name: b.category?.name ?? b.name,
      Budget: Math.round(b.proportionalBudget ?? b.amount),
      Spent:  Math.round(b.currentSpent ?? 0),
      status: b.status,
    }));
  }, [budgetRows]);

  // Burn rate (horizontal) chart
  const burnRateData = useMemo(() => {
    return [...budgetRows]
      .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
      .map((b) => ({
        name:       b.category?.name ?? b.name,
        percentage: Math.round(Math.min(b.percentage ?? 0, 150)), // cap visual at 150%
        realPct:    b.percentage ?? 0,
        status:     b.status,
      }));
  }, [budgetRows]);

  const overallStats = stats?.overallStats ?? {};
  const alertsToShow = showAllAlerts ? alerts : alerts.slice(0, 8);
  const unreadCount  = alerts.filter((a) => !a.isRead).length;

  // ── fetchers ────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    const token = getToken();
    if (!token) { setError("Not authenticated."); return; }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ startDate: range.startDate, endDate: range.endDate });
      const res = await fetch(`${API}/budgets/stats?${params}`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load budget stats");
      }
      setStats(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  const fetchAlerts = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setAlertsLoading(true);
    try {
      const res = await fetch(`${API}/budgets/alerts`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) setAlerts(await res.json());
    } catch { /* silent */ }
    finally { setAlertsLoading(false); }
  }, []);

  const markAlertRead = async (alertId) => {
    const token = getToken();
    try {
      await fetch(`${API}/budgets/alerts/${alertId}/read`, {
        method: "PUT",
        headers: { Authorization: `jwt ${token}` },
      });
      setAlerts((prev) => prev.map((a) => a._id === alertId ? { ...a, isRead: true } : a));
    } catch { /* silent */ }
  };

  useEffect(() => { fetchStats();  }, [fetchStats]);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ── handlers ────────────────────────────────────────────────────────────────

  const applyPreset = (preset) => {
    setActivePreset(preset.label);
    setRange(preset.getRange());
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const headers = ["Category", "Budget", "Spent", "Remaining", "Burn Rate %", "Status"];
    const rows = sortedRows.map((b) => [
      b.category?.name ?? b.name,
      (b.proportionalBudget ?? b.amount).toFixed(2),
      (b.currentSpent ?? 0).toFixed(2),
      (b.remaining ?? 0).toFixed(2),
      (b.percentage ?? 0).toFixed(1),
      STATUS_CONFIG[b.status]?.label ?? b.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `budget-analytics-${range.startDate}-to-${range.endDate}.csv`;
    a.click();
  };

  // ── burn-rate bar fill (per cell) ──────────────────────────────────────────

  function burnBarFill(entry) {
    const pct = entry?.realPct ?? 0;
    if (pct > 100) return "#ef4444";
    if (pct >= 80)  return "#f59e0b";
    return "#10b981";
  }

  // ── spending bar fill (per Spent bar cell) ────────────────────────────────

  function spendingFill(entry) {
    if (!entry) return "#6366f1";
    return STATUS_CONFIG[entry.status]?.bar ?? "#6366f1";
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 py-18">

      {/* ── sticky page header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 bg-clip-text text-transparent leading-none">
                Budget Analytics
              </h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5 truncate">
                {fmtDate(range.startDate)} → {fmtDate(range.endDate)}
                &nbsp;·&nbsp;{budgetRows.length} budget{budgetRows.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
            )}
            <button
              onClick={exportCSV}
              disabled={!budgetRows.length}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => { fetchStats(); fetchAlerts(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── date range / presets ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activePreset === p.label
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
              <input
                type="date"
                value={range.startDate}
                onChange={(e) => { setRange((r) => ({ ...r, startDate: e.target.value })); setActivePreset(""); }}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
              <input
                type="date"
                value={range.endDate}
                onChange={(e) => { setRange((r) => ({ ...r, endDate: e.target.value })); setActivePreset(""); }}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── error ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {/* ── KPI row ────────────────────────────────────────────────────── */}
        {isFirstLoad ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array(6).fill(null).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard
              icon={Wallet}
              label="Total Budget"
              value={money(overallStats.totalBudget)}
              sub={`${overallStats.activeBudgets ?? 0} active budget${overallStats.activeBudgets !== 1 ? "s" : ""}`}
              tone="blue"
            />
            <KPICard
              icon={TrendingUp}
              label="Total Spent"
              value={money(overallStats.totalSpent)}
              sub={`${(overallStats.overallPercentage ?? 0).toFixed(1)}% used`}
              tone="purple"
            />
            <KPICard
              icon={Target}
              label="Remaining"
              value={money(overallStats.totalRemaining)}
              sub="across all budgets"
              tone="emerald"
            />
            <KPICard
              icon={ShieldCheck}
              label="On Track"
              value={overallStats.onTrackBudgets ?? 0}
              sub="budgets within limit"
              tone="emerald"
              badge={`${overallStats.onTrackBudgets ?? 0}/${overallStats.activeBudgets ?? 0}`}
              badgeTone="emerald"
            />
            <KPICard
              icon={AlertTriangle}
              label="Near Limit"
              value={overallStats.almostExceededBudgets ?? 0}
              sub={`+ ${overallStats.limitReachedBudgets ?? 0} at limit`}
              tone="amber"
              badge={(overallStats.almostExceededBudgets ?? 0) > 0 ? `${overallStats.almostExceededBudgets} warn` : "None"}
              badgeTone={(overallStats.almostExceededBudgets ?? 0) > 0 ? "rose" : "emerald"}
            />
            <KPICard
              icon={ShieldAlert}
              label="Exceeded"
              value={overallStats.exceededBudgets ?? 0}
              sub="budgets over limit"
              tone="rose"
              badge={(overallStats.exceededBudgets ?? 0) > 0 ? `${overallStats.exceededBudgets} over` : "All clear"}
              badgeTone={(overallStats.exceededBudgets ?? 0) > 0 ? "rose" : "emerald"}
            />
          </div>
        ) : null}

        {/* ── no data state ───────────────────────────────────────────────── */}
        {!isFirstLoad && stats && budgetRows.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-9 h-9 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No budgets found</h3>
            <p className="text-gray-400">There are no active budgets for the selected date range. Try adjusting the dates.</p>
          </div>
        )}

        {budgetRows.length > 0 && (
          <>
            {/* ── overall burn rate progress bar ─────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Overall Budget Utilization</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Total spent vs. total allocated for this period</p>
                </div>
                <span className={`text-2xl font-black ${
                  (overallStats.overallPercentage ?? 0) > 100 ? "text-red-600"
                  : (overallStats.overallPercentage ?? 0) >= 80 ? "text-amber-600"
                  : "text-emerald-600"
                }`}>
                  {(overallStats.overallPercentage ?? 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    (overallStats.overallPercentage ?? 0) > 100 ? "bg-gradient-to-r from-red-400 to-rose-500"
                    : (overallStats.overallPercentage ?? 0) >= 80 ? "bg-gradient-to-r from-amber-400 to-orange-500"
                    : "bg-gradient-to-r from-emerald-400 to-green-500"
                  }`}
                  style={{ width: `${Math.min(overallStats.overallPercentage ?? 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{moneyExact(overallStats.totalSpent)} spent</span>
                <span>{moneyExact(overallStats.totalBudget)} budgeted</span>
              </div>
            </div>

            {/* ── charts row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Budget vs. Spending grouped bar chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Budget vs. Spending by Category</h2>
                <p className="text-xs text-gray-400 mb-6">Allocated budget (blue) compared to actual spending (status-colored)</p>
                {isFirstLoad ? (
                  <div className="h-[320px] bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={spendingChartData}
                      margin={{ top: 4, right: 8, left: 0, bottom: 48 }}
                      barCategoryGap="30%"
                      barGap={3}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={60}
                      />
                      <YAxis
                        tickFormatter={yTickMoney}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip content={<BudgetBarTooltip />} cursor={{ fill: "#f8fafc" }} />
                      <Legend wrapperStyle={{ paddingTop: "8px", fontSize: "12px", fontWeight: 600 }} />
                      <Bar dataKey="Budget" name="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="Spent"  name="Spent"  radius={[4, 4, 0, 0]} maxBarSize={36}>
                        {spendingChartData.map((entry, i) => (
                          <Cell key={i} fill={spendingFill(entry)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Burn rate per category */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Burn Rate by Category</h2>
                <p className="text-xs text-gray-400 mb-6">% of budget used — sorted by highest utilization. Dashed line = 80% threshold.</p>
                {isFirstLoad ? (
                  <div className="h-[320px] bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={burnRateData}
                      layout="vertical"
                      margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, Math.max(100, ...burnRateData.map((d) => d.percentage))]}
                        tickFormatter={yTickPct}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip content={<BurnRateTooltip />} cursor={{ fill: "#f8fafc" }} />
                      <ReferenceLine x={80} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "80%", position: "top", fontSize: 10, fill: "#f59e0b", fontWeight: 700 }} />
                      <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "100%", position: "top", fontSize: 10, fill: "#ef4444", fontWeight: 700 }} />
                      <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={22}>
                        {burnRateData.map((entry, i) => (
                          <Cell key={i} fill={burnBarFill(entry)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── budget detail table ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Budget Breakdown</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{budgetRows.length} budget{budgetRows.length !== 1 ? "s" : ""} for this period</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80">
                      {[
                        { key: "name",             label: "Budget Name"   },
                        { key: "category",         label: "Category"      },
                        { key: "proportionalBudget", label: "Budget"      },
                        { key: "currentSpent",     label: "Spent"         },
                        { key: "remaining",        label: "Remaining"     },
                        { key: "percentage",       label: "Burn Rate"     },
                        { key: "status",           label: "Status"        },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="px-4 py-3 text-left font-bold text-xs text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 whitespace-nowrap select-none"
                        >
                          <span className="inline-flex items-center gap-1">
                            {label}
                            <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left font-bold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayedRows.map((b, i) => {
                      const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.on_track;
                      const pct = Math.min(b.percentage ?? 0, 100);
                      return (
                        <tr
                          key={b._id ?? i}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap max-w-[160px] truncate">
                            {b.name}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              {b.category?.icon && <span>{b.category.icon}</span>}
                              <span className="text-gray-700">{b.category?.name ?? "—"}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                            {moneyExact(b.proportionalBudget ?? b.amount)}
                          </td>
                          <td className="px-4 py-3.5 font-semibold whitespace-nowrap">
                            <span className={cfg.color}>{moneyExact(b.currentSpent ?? 0)}</span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                            {moneyExact(b.remaining ?? 0)}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${pct}%`, backgroundColor: cfg.bar }}
                                />
                              </div>
                              <span className={`text-xs font-bold w-10 text-right ${cfg.color}`}>
                                {(b.percentage ?? 0).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                            {fmtDate(b.startDate)} → {fmtDate(b.endDate)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {sortedRows.length > 10 && (
                <div className="px-6 py-3 border-t border-gray-50">
                  <button
                    onClick={() => setShowAllBudgets((p) => !p)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {showAllBudgets ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Show all {sortedRows.length} budgets</>}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── alert history ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Alert History</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {alerts.length} total · {unreadCount} unread
                </p>
              </div>
            </div>
          </div>

          {alertsLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-16 text-center">
              <BellOff className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No alerts yet</p>
              <p className="text-gray-300 text-sm mt-1">Alerts appear when budgets approach or exceed their limits.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {alertsToShow.map((alert) => {
                const cfg = ALERT_TYPE_CONFIG[alert.type] ?? ALERT_TYPE_CONFIG.threshold_reached;
                const AlertIcon = cfg.icon;
                return (
                  <div
                    key={alert._id}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                      !alert.isRead ? "bg-amber-50/40" : "hover:bg-gray-50/60"
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                      <AlertIcon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtRelative(alert.createdAt)} ·{" "}
                            <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
                            {" · "}{(alert.percentage ?? 0).toFixed(1)}% used
                          </p>
                        </div>
                        {!alert.isRead && (
                          <button
                            onClick={() => markAlertRead(alert._id)}
                            className="flex-shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
                          >
                            Mark read
                          </button>
                        )}
                        {alert.isRead && (
                          <span className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-300 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Read
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-48">
                        <div
                          className={`h-full rounded-full ${
                            (alert.percentage ?? 0) > 100 ? "bg-red-400"
                            : (alert.percentage ?? 0) >= 80 ? "bg-amber-400"
                            : "bg-emerald-400"
                          }`}
                          style={{ width: `${Math.min(alert.percentage ?? 0, 100)}%` }}
                        />
                      </div>
                    </div>
                    {!alert.isRead && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}

              {alerts.length > 8 && (
                <div className="px-6 py-3">
                  <button
                    onClick={() => setShowAllAlerts((p) => !p)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {showAllAlerts ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Show all {alerts.length} alerts</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── legend footer ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-4 justify-center pb-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-gray-500 font-medium">{cfg.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
