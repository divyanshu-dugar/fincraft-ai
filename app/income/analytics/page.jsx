"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Filter,
  LineChart as LineChartIcon,
  Minus,
  RefreshCw,
  Tags,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";

// ─── palette ────────────────────────────────────────────────────────────────
const COLORS = [
  "#10b981", "#22c55e", "#14b8a6", "#34d399",
  "#3b82f6", "#60a5fa", "#6366f1", "#8b5cf6",
  "#f59e0b", "#f97316", "#ef4444", "#f43f5e",
];

const PRESETS = [
  { label: "3M",  months: 3  },
  { label: "6M",  months: 6  },
  { label: "12M", months: 12 },
];

// ─── utilities ───────────────────────────────────────────────────────────────
function toMonthInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function defaultRange() {
  const now = new Date();
  return {
    startMonth: toMonthInput(new Date(now.getFullYear(), now.getMonth() - 5, 1)),
    endMonth:   toMonthInput(new Date(now.getFullYear(), now.getMonth(),     1)),
  };
}

function money(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(v || 0);
}

function pct(v) {
  const n = Number(v || 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function fmtMonth(yyyyMM) {
  if (!yyyyMM || !yyyyMM.includes("-")) return yyyyMM || "";
  const [y, m] = yyyyMM.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", { month: "short", year: "2-digit" });
}

function categoryColor(categories, categoryId) {
  const cat = categories.find((c) => c.categoryId === categoryId);
  return cat?.categoryColor || COLORS[0];
}

// ─── skeleton pieces ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="w-16 h-5 bg-gray-100 rounded-full" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-20 mb-1" />
      <div className="h-3 bg-gray-100 rounded w-24" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-72 mb-8" />
      <div className="h-[340px] bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl" />
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
const TONES = {
  emerald: { bg: "from-white to-emerald-50/40", border: "border-emerald-100/60", icon: "bg-emerald-100 text-emerald-600" },
  green:   { bg: "from-white to-green-50/40",   border: "border-green-100/60",   icon: "bg-green-100 text-green-600"    },
  purple:  { bg: "from-white to-purple-50/40",  border: "border-purple-100/60",  icon: "bg-purple-100 text-purple-600"  },
  amber:   { bg: "from-white to-amber-50/40",   border: "border-amber-100/60",   icon: "bg-amber-100 text-amber-600"    },
  rose:    { bg: "from-white to-rose-50/40",    border: "border-rose-100/60",    icon: "bg-rose-100 text-rose-600"      },
};

function KPICard({ icon: Icon, label, value, sub, tone = "emerald", badge }) {
  const t = TONES[tone] || TONES.emerald;
  return (
    <div className={`bg-gradient-to-br ${t.bg} rounded-2xl border ${t.border} p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${t.icon} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge !== undefined && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            badge > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
          }`}>
            {badge > 0 ? `${badge} spike${badge > 1 ? "s" : ""}` : "All clear"}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-tight truncate">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
      {sub ? <p className="text-xs text-gray-400 mt-1">{sub}</p> : null}
    </div>
  );
}

// ─── anomaly alert banner ─────────────────────────────────────────────────────
function AnomalyAlert({ anomalies }) {
  const [expanded, setExpanded] = useState(false);
  if (!anomalies?.length) return null;
  const shown = expanded ? anomalies : anomalies.slice(0, 3);
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-xl mt-0.5 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="font-bold text-amber-900 text-sm">
              {anomalies.length} unusual income spike{anomalies.length > 1 ? "s" : ""} detected in this period
            </p>
            {anomalies.length > 3 && (
              <button onClick={() => setExpanded((p) => !p)} className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0">
                {expanded ? "Show less" : `+${anomalies.length - 3} more`}
              </button>
            )}
          </div>
          <p className="text-xs text-amber-600 mt-1 mb-3">
            These categories earned significantly more than their trailing 3-month average.
          </p>
          <div className="space-y-2">
            {shown.map((row, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-2.5 text-sm shadow-sm border border-amber-100/50">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.anomaly?.severity === "high" ? "bg-amber-500" : "bg-yellow-500"}`} />
                <span className="font-semibold text-gray-800 truncate">
                  {row.categoryIcon || ""} {row.category}
                </span>
                <span className="text-gray-400 text-xs flex-shrink-0">{fmtMonth(row.month)}</span>
                {row.anomaly?.reason && (
                  <span className="text-gray-400 text-xs hidden md:block truncate flex-1">{row.anomaly.reason}</span>
                )}
                <span className="ml-auto font-bold text-emerald-700 flex-shrink-0">{money(row.amount)}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  row.anomaly?.severity === "high" ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {row.anomaly?.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── custom recharts tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].filter((p) => (p.value || 0) > 0).sort((a, b) => (b.value || 0) - (a.value || 0));
  const total = sorted.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl p-4 min-w-[200px] max-w-[260px]">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{fmtMonth(label)}</p>
      <div className="space-y-1.5">
        {sorted.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || item.fill || item.stroke }} />
              <span className="text-sm text-gray-600 truncate">{item.dataKey}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{money(item.value)}</span>
          </div>
        ))}
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
          <span className="text-sm font-bold text-gray-900">{money(total)}</span>
        </div>
      )}
    </div>
  );
}

// ─── sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === "asc"
    ? <ChevronUp   className="w-3.5 h-3.5 text-emerald-500" />
    : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />;
}

// ─── axis formatters ──────────────────────────────────────────────────────────
function yTickFmt(v) { return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`; }

// ─── page ─────────────────────────────────────────────────────────────────────
export default function IncomeAnalyticsPage() {
  const [range,               setRange]               = useState(defaultRange);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [chartView,           setChartView]           = useState("bar");
  const [sortKey,             setSortKey]             = useState("amount");
  const [sortDir,             setSortDir]             = useState("desc");
  const [showAllRows,         setShowAllRows]         = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState("");
  const [data, setData] = useState({
    categories: [], months: [], table: [],
    chart: { groupedBars: [], trendLines: [] },
    anomalies: [], summary: { totalRows: 0, anomalyCount: 0 },
  });

  const isFirstLoad   = loading && data.months.length === 0;
  const isRefreshing  = loading && data.months.length > 0;

  // ── derived ─────────────────────────────────────────────────────────────────
  const categoryIdSet = useMemo(() => new Set(selectedCategoryIds), [selectedCategoryIds]);

  const activeCategories = useMemo(() => {
    if (!selectedCategoryIds.length) return data.categories;
    return data.categories.filter((c) => categoryIdSet.has(c.categoryId));
  }, [data.categories, selectedCategoryIds, categoryIdSet]);

  const filteredTableRows = useMemo(() => {
    if (!selectedCategoryIds.length) return data.table;
    return data.table.filter((r) => categoryIdSet.has(r.categoryId));
  }, [data.table, selectedCategoryIds, categoryIdSet]);

  const sortedTableRows = useMemo(() => {
    return [...filteredTableRows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return typeof av === "string" ? av.localeCompare(bv) * dir : (av - bv) * dir;
    });
  }, [filteredTableRows, sortKey, sortDir]);

  const visibleRows = useMemo(
    () => (showAllRows ? sortedTableRows : sortedTableRows.slice(0, 20)),
    [sortedTableRows, showAllRows]
  );

  const maxAmount = useMemo(() => Math.max(...filteredTableRows.map((r) => r.amount), 1), [filteredTableRows]);

  const kpis = useMemo(() => {
    const total = filteredTableRows.reduce((s, r) => s + r.amount, 0);
    const monthMap = {};
    const catMap   = {};
    for (const r of filteredTableRows) {
      monthMap[r.month]    = (monthMap[r.month]    || 0) + r.amount;
      catMap[r.category]   = (catMap[r.category]   || 0) + r.amount;
    }
    const peakEntry = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];
    const topCat    = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    return {
      total,
      peakMonth:    peakEntry ? fmtMonth(peakEntry[0]) : "—",
      peakAmount:   peakEntry?.[1] || 0,
      topCategory:  topCat?.[0] || "—",
      topAmount:    topCat?.[1] || 0,
      anomalyCount: data.summary?.anomalyCount || 0,
    };
  }, [filteredTableRows, data.summary]);

  const lineChartData = useMemo(() => {
    const map = new Map(data.months.map((m) => [m, { month: m }]));
    for (const series of data.chart.trendLines || []) {
      if (selectedCategoryIds.length && !categoryIdSet.has(series.categoryId)) continue;
      for (const point of series.data) {
        const row = map.get(point.month) || { month: point.month };
        row[series.category] = point.amount;
        map.set(point.month, row);
      }
    }
    return data.months.map((m) => map.get(m) || { month: m });
  }, [data.chart.trendLines, data.months, selectedCategoryIds, categoryIdSet]);

  const anomalyMonths = useMemo(() => new Set(data.anomalies.map((r) => r.month)), [data.anomalies]);
  const hasData = filteredTableRows.length > 0;

  // ── fetchers ─────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) setAvailableCategories(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const token = getToken();
    if (!token) { setError("Please log in to view analytics."); return; }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ startMonth: range.startMonth, endMonth: range.endMonth });
      if (selectedCategoryIds.length) params.set("categoryIds", selectedCategoryIds.join(","));
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/income/analytics/category-month-comparison?${params}`,
        { headers: { Authorization: `jwt ${token}` } }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load analytics");
      }
      setData(await res.json());
      setShowAllRows(false);
    } catch (err) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [range.startMonth, range.endMonth, selectedCategoryIds]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchAnalytics();  }, [fetchAnalytics]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const applyPreset = (months) => {
    const now = new Date();
    setRange({
      startMonth: toMonthInput(new Date(now.getFullYear(), now.getMonth() - months + 1, 1)),
      endMonth:   toMonthInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    });
  };

  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const header = "Month,Category,Amount,Change %,3-mo. avg,Anomaly\n";
    const rows = sortedTableRows.map((r) =>
      `${r.month},"${r.category}",${r.amount},${r.changePct},${r.movingAverage},${r.anomaly?.isSpike ? r.anomaly.severity : "normal"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `income-analytics-${range.startMonth}-${range.endMonth}.csv`; a.click();
  };

  // ─── shared axis props ───────────────────────────────────────────────────────
  const xAxisProps = {
    dataKey: "month",
    tickFormatter: fmtMonth,
    tick: { fontSize: 12, fontWeight: 600, fill: "#64748b" },
    axisLine: false,
    tickLine: false,
  };
  const yAxisProps = {
    tickFormatter: yTickFmt,
    tick: { fontSize: 12, fill: "#94a3b8" },
    axisLine: false,
    tickLine: false,
    width: 64,
  };

  // ─── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-green-50/10 pt-18">

      {/* ── sticky page header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-green-600 bg-clip-text text-transparent leading-none">
                Income Analytics
              </h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5 truncate">
                {fmtMonth(range.startMonth)} → {fmtMonth(range.endMonth)}
                &nbsp;·&nbsp;{activeCategories.length} categor{activeCategories.length === 1 ? "y" : "ies"}
                {isRefreshing ? " · Refreshing…" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={exportCSV}
            disabled={!hasData || isFirstLoad}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

        {/* ── controls ─────────────────────────────────────────────────────── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Filters & Date range</h2>
            {selectedCategoryIds.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {selectedCategoryIds.length} selected
              </span>
            )}
          </div>

          {/* range row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick range</p>
              <div className="flex gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => applyPreset(p.months)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Start month</p>
              <input type="month" value={range.startMonth} max={range.endMonth}
                onChange={(e) => setRange((p) => ({ ...p, startMonth: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">End month</p>
              <input type="month" value={range.endMonth} min={range.startMonth}
                onChange={(e) => setRange((p) => ({ ...p, endMonth: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
            </div>
            <div className="flex items-end">
              <button onClick={fetchAnalytics} disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* category filter chips */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</p>
                <span className="text-xs text-gray-400">
                  {selectedCategoryIds.length ? `${selectedCategoryIds.length} of ${availableCategories.length}` : "All"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedCategoryIds(availableCategories.map((c) => c._id))}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline">Select all</button>
                <span className="text-gray-300 select-none">|</span>
                <button onClick={() => setSelectedCategoryIds([])}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-700 hover:underline">Clear</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const isActive = selectedCategoryIds.includes(cat._id);
                const color = cat.color || "#10b981";
                return (
                  <button key={cat._id} onClick={() => toggleCategory(cat._id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      isActive ? "border-transparent text-white shadow-md" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    style={isActive ? { backgroundColor: color } : undefined}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? "white" : color }} />
                    {cat.icon || ""} {cat.name}
                  </button>
                );
              })}
              {availableCategories.length === 0 && (
                <p className="text-sm text-gray-400 italic">No income categories found. Create some first.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── error banner ─────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-rose-800 text-sm">Failed to load analytics</p>
              <p className="text-sm text-rose-600 mt-0.5">{error}</p>
              <button onClick={fetchAnalytics} className="mt-3 text-xs font-bold text-rose-700 underline hover:text-rose-900">Try again</button>
            </div>
          </div>
        )}

        {/* ── KPI cards ────────────────────────────────────────────────────── */}
        {isFirstLoad ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard icon={TrendingUp} label="Total income in range"
              value={money(kpis.total)}
              sub={`${data.months.length} month${data.months.length !== 1 ? "s" : ""} · ${activeCategories.length} categor${activeCategories.length !== 1 ? "ies" : "y"}`}
              tone="emerald" />
            <KPICard icon={BarChart3} label="Highest income month"
              value={kpis.peakMonth}
              sub={kpis.peakAmount > 0 ? money(kpis.peakAmount) + " total" : "No data"}
              tone="purple" />
            <KPICard icon={Zap} label="Top income category"
              value={kpis.topCategory}
              sub={kpis.topAmount > 0 ? money(kpis.topAmount) + " total" : "No data"}
              tone="amber" />
            <KPICard icon={AlertTriangle} label="Income anomalies"
              value={String(kpis.anomalyCount)}
              sub={kpis.anomalyCount > 0 ? "Unusual spikes — review below" : "No unusual spikes this period"}
              tone={kpis.anomalyCount > 0 ? "rose" : "green"}
              badge={kpis.anomalyCount} />
          </div>
        )}

        {/* ── chart + table ─────────────────────────────────────────────────── */}
        {isFirstLoad ? (
          <><ChartSkeleton /><ChartSkeleton /></>
        ) : !hasData && !error ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No income data in this range</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              No income was recorded in the selected period. Try adjusting the date range or removing category filters.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => applyPreset(p.months)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
                  Try last {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : hasData ? (
          <>
            <AnomalyAlert anomalies={data.anomalies} />

            {/* charts card */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-6 shadow-sm transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Income by category</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Month-on-month breakdown
                    {anomalyMonths.size > 0 && (
                      <span className="ml-2 text-amber-500 font-semibold">— dashed lines mark anomaly months</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 flex-shrink-0">
                  {[
                    { key: "bar",  icon: BarChart3,     label: "Bar"  },
                    { key: "line", icon: LineChartIcon, label: "Line" },
                    { key: "area", icon: Activity,      label: "Area" },
                  ].map((v) => (
                    <button key={v.key} onClick={() => setChartView(v.key)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        chartView === v.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                      }`}>
                      <v.icon className="w-3.5 h-3.5" />{v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === "bar" ? (
                    <BarChart data={data.chart.groupedBars} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis {...xAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                      {activeCategories.map((cat) => (
                        <Bar key={cat.categoryId} dataKey={cat.categoryName}
                          fill={categoryColor(data.categories, cat.categoryId)}
                          radius={[4, 4, 0, 0]} maxBarSize={44} />
                      ))}
                      {Array.from(anomalyMonths).map((month) => (
                        <ReferenceLine key={month} x={month} stroke="#fcd34d" strokeWidth={1.5} strokeDasharray="5 4" />
                      ))}
                    </BarChart>
                  ) : chartView === "line" ? (
                    <LineChart data={lineChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis {...xAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                      {activeCategories.map((cat) => (
                        <Line key={cat.categoryId} type="monotone" dataKey={cat.categoryName}
                          stroke={categoryColor(data.categories, cat.categoryId)}
                          strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                          activeDot={{ r: 6, strokeWidth: 0 }} connectNulls />
                      ))}
                      {Array.from(anomalyMonths).map((month) => (
                        <ReferenceLine key={month} x={month} stroke="#fcd34d" strokeWidth={1.5} strokeDasharray="5 4" />
                      ))}
                    </LineChart>
                  ) : (
                    <AreaChart data={lineChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        {activeCategories.map((cat) => {
                          const color = categoryColor(data.categories, cat.categoryId);
                          return (
                            <linearGradient key={cat.categoryId} id={`igrad-${cat.categoryId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis {...xAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                      {activeCategories.map((cat) => {
                        const color = categoryColor(data.categories, cat.categoryId);
                        return (
                          <Area key={cat.categoryId} type="monotone" dataKey={cat.categoryName}
                            stroke={color} strokeWidth={2.5}
                            fill={`url(#igrad-${cat.categoryId})`}
                            activeDot={{ r: 6, strokeWidth: 0 }} connectNulls />
                        );
                      })}
                      {Array.from(anomalyMonths).map((month) => (
                        <ReferenceLine key={month} x={month} stroke="#fcd34d" strokeWidth={1.5} strokeDasharray="5 4" />
                      ))}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* detailed table */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
              <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Detailed breakdown</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {filteredTableRows.length} record{filteredTableRows.length !== 1 ? "s" : ""}
                    &nbsp;· click any column header to sort
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Spike</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300" />Normal</span>
                  <span className="flex items-center gap-1.5"><span className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-emerald-200 rounded-full" />Relative size</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-gray-50/50 border-b border-gray-100">
                    <tr>
                      {[
                        { key: "month",         label: "Month"     },
                        { key: "category",      label: "Category"  },
                        { key: "amount",        label: "Amount"    },
                        { key: "changePct",     label: "Change %"  },
                        { key: "movingAverage", label: "3-mo. avg" },
                        { key: null,            label: "Size"      },
                        { key: null,            label: "Anomaly"   },
                      ].map(({ key, label }) => (
                        <th key={label} onClick={() => key && handleSort(key)}
                          className={`px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${key ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}>
                          <span className="flex items-center gap-1">
                            {label}
                            {key && <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visibleRows.map((row) => {
                      const color    = row.categoryColor || categoryColor(data.categories, row.categoryId);
                      const isSpike  = row.anomaly?.isSpike;
                      const barWidth = Math.min((row.amount / maxAmount) * 100, 100);
                      const isUp     = row.changePct > 0.5;
                      const isDown   = row.changePct < -0.5;
                      return (
                        <tr key={`${row.month}_${row.categoryId}`}
                          className={`transition-colors hover:bg-emerald-50/30 ${isSpike ? "bg-amber-50/30" : ""}`}>
                          <td className="px-5 py-3.5 font-semibold text-gray-700 whitespace-nowrap">{fmtMonth(row.month)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                              <span className="font-medium text-gray-800">{row.categoryIcon || ""} {row.category}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900 whitespace-nowrap">{money(row.amount)}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              isUp ? "text-emerald-600" : isDown ? "text-rose-600" : "text-gray-400"
                            }`}>
                              {isUp   ? <ArrowUpRight   className="w-3.5 h-3.5" /> :
                               isDown ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                                        <Minus          className="w-3.5 h-3.5" />}
                              {pct(row.changePct)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{money(row.movingAverage)}</td>
                          <td className="px-5 py-3.5 w-32">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                              <div className="h-1.5 rounded-full transition-all duration-700"
                                style={{ width: `${barWidth}%`, backgroundColor: color }} />
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {isSpike ? (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                row.anomaly.severity === "high" ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${row.anomaly.severity === "high" ? "bg-amber-500" : "bg-yellow-500"}`} />
                                Spike · {row.anomaly.severity}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTableRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center">
                          <p className="text-gray-400 font-medium">No records match the current filters.</p>
                          <button onClick={() => setSelectedCategoryIds([])} className="mt-2 text-sm text-emerald-600 hover:underline">
                            Clear category filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredTableRows.length > 0 && (
                    <tfoot className="bg-gradient-to-r from-slate-50 to-gray-50/50 border-t border-gray-200">
                      <tr>
                        <td colSpan={2} className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Total ({filteredTableRows.length} rows)
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          {money(filteredTableRows.reduce((s, r) => s + r.amount, 0))}
                        </td>
                        <td colSpan={4} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {sortedTableRows.length > 20 && (
                <div className="px-6 py-4 border-t border-gray-100 text-center bg-slate-50/50">
                  <button onClick={() => setShowAllRows((p) => !p)}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 hover:underline">
                    {showAllRows
                      ? "Show fewer rows"
                      : `Show all ${sortedTableRows.length} rows (${sortedTableRows.length - 20} more)`}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
