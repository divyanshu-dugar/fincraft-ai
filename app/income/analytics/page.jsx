"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  ExternalLink,
  Filter,
  GitCompare,
  SlidersHorizontal,
  LineChart as LineChartIcon,
  Minus,
  RefreshCw,
  Search,
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
  { label: "YTD", months: null },
];

// ─── utilities ───────────────────────────────────────────────────────────────
function toMonthInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function defaultRange() {
  const now = new Date();
  return {
    startMonth: `${now.getFullYear()}-01`,
    endMonth:   toMonthInput(new Date(now.getFullYear(), now.getMonth(), 1)),
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
    <div className="bg-slate-800/60 rounded-2xl border border-emerald-400/20 p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 bg-slate-700 rounded-xl" />
        <div className="w-16 h-5 bg-slate-700 rounded-full" />
      </div>
      <div className="h-7 bg-slate-700 rounded w-32 mb-2" />
      <div className="h-3 bg-slate-700/60 rounded w-20 mb-1" />
      <div className="h-3 bg-slate-700/60 rounded w-24" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-slate-800/60 rounded-2xl border border-emerald-400/20 p-6 animate-pulse">
      <div className="h-5 bg-slate-700 rounded w-48 mb-2" />
      <div className="h-3 bg-slate-700/60 rounded w-72 mb-8" />
      <div className="h-[340px] bg-slate-700/40 rounded-xl" />
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
const TONES = {
  emerald: { bg: "bg-slate-800/60",    border: "border-emerald-500/30", icon: "bg-emerald-500/20 text-emerald-400" },
  green:   { bg: "bg-slate-800/60",    border: "border-green-500/30",   icon: "bg-green-500/20 text-green-400"    },
  purple:  { bg: "bg-slate-800/60",    border: "border-purple-500/30",  icon: "bg-purple-500/20 text-purple-400"  },
  amber:   { bg: "bg-slate-800/60",    border: "border-amber-500/30",   icon: "bg-amber-500/20 text-amber-400"    },
  rose:    { bg: "bg-slate-800/60",    border: "border-rose-500/30",    icon: "bg-rose-500/20 text-rose-400"      },
};

function KPICard({ icon: Icon, label, value, sub, tone = "emerald", badge }) {
  const t = TONES[tone] || TONES.emerald;
  return (
    <div className={`${t.bg} rounded-2xl border ${t.border} p-6 hover:border-opacity-60 transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${t.icon} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge !== undefined && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            badge > 0 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
          }`}>
            {badge > 0 ? `${badge} spike${badge > 1 ? "s" : ""}` : "All clear"}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white leading-tight truncate">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
      {sub ? <p className="text-xs text-slate-500 mt-1">{sub}</p> : null}
    </div>
  );
}

// ─── anomaly alert banner ─────────────────────────────────────────────────────
function AnomalyAlert({ anomalies }) {
  const [expanded, setExpanded] = useState(false);
  if (!anomalies?.length) return null;
  const shown = expanded ? anomalies : anomalies.slice(0, 3);
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-xl mt-0.5 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="font-bold text-amber-300 text-sm">
              {anomalies.length} unusual income spike{anomalies.length > 1 ? "s" : ""} detected in this period
            </p>
            {anomalies.length > 3 && (
              <button onClick={() => setExpanded((p) => !p)} className="text-xs font-semibold text-amber-400 hover:underline flex-shrink-0">
                {expanded ? "Show less" : `+${anomalies.length - 3} more`}
              </button>
            )}
          </div>
          <p className="text-xs text-amber-400 mt-1 mb-3">
            These categories earned significantly more than their trailing 3-month average.
          </p>
          <div className="space-y-2">
            {shown.map((row, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800/80 rounded-xl px-4 py-2.5 text-sm border border-amber-500/20">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.anomaly?.severity === "high" ? "bg-amber-500" : "bg-yellow-500"}`} />
                <span className="font-semibold text-white truncate">
                  {row.categoryIcon || ""} {row.category}
                </span>
                <span className="text-slate-400 text-xs flex-shrink-0">{fmtMonth(row.month)}</span>
                {row.anomaly?.reason && (
                  <span className="text-slate-400 text-xs hidden md:block truncate flex-1">{row.anomaly.reason}</span>
                )}
                <span className="ml-auto font-bold text-emerald-400 flex-shrink-0">{money(row.amount)}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  row.anomaly?.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-yellow-500/20 text-yellow-400"
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
    <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 min-w-[200px] max-w-[260px]">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{fmtMonth(label)}</p>
      <div className="space-y-1.5">
        {sorted.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || item.fill || item.stroke }} />
              <span className="text-sm text-slate-400 truncate">{item.dataKey}</span>
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">{money(item.value)}</span>
          </div>
        ))}
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-sm font-bold text-white">{money(total)}</span>
        </div>
      )}
    </div>
  );
}

// ─── month-on-month per-category card ────────────────────────────────────────
function CategoryMoMCard({ category, rows, months, defaultOpen = false, range }) {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();
  const color = rows[0]?.categoryColor || COLORS[0];

  // pre-index rows by month for O(1) lookup
  const byMonth = useMemo(() => {
    const m = {};
    for (const r of rows) m[r.month] = r;
    return m;
  }, [rows]);

  const totalIncome = rows.reduce((s, r) => s + r.amount, 0);
  const bestMonth  = rows.reduce((best, r) => (r.amount > (best?.amount ?? -1) ? r : best), null);
  const spikeCount = rows.filter((r) => r.anomaly?.isSpike).length;

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 overflow-hidden">
      {/* ── category header (always visible) ── */}
      <div className="flex items-center hover:bg-slate-700/30 transition-colors group">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex-1 flex items-center gap-4 px-5 py-4 text-left min-w-0"
        >
          {/* color dot + name */}
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                {category.categoryIcon} {category.categoryName}
              </span>
              {spikeCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                  {spikeCount} spike{spikeCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* summary chips */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0 text-xs text-slate-400">
            <span className="font-bold text-white">{money(totalIncome)}</span>
            <span>total</span>
            {bestMonth && (
              <>
                <span className="text-slate-600">·</span>
                <span>peak: <span className="font-semibold text-slate-300">{fmtMonth(bestMonth.month)}</span></span>
              </>
            )}
          </div>

          {/* chevron */}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* view-in-list button — sibling of expand button to avoid nested <button> */}
        {range && (
          <button
            onClick={() => {
              const startDate = `${range.startMonth}-01`;
              const [ey, em] = range.endMonth.split("-").map(Number);
              const endDate = new Date(Date.UTC(ey, em, 0)).toISOString().split("T")[0];
              router.push(
                `/income/list?category=${category.categoryId}&startDate=${startDate}&endDate=${endDate}`
              );
            }}
            className="flex-shrink-0 p-1.5 mr-3 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
            title="View incomes in list"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── months grid (expandable) ── */}
      {open && (
        <div className="border-t border-slate-700/50 px-5 py-4">
          {/* month column headers */}
          <div
            className="grid gap-2 mb-2"
            style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}
          >
            {months.map((m) => (
              <div key={m} className="text-center">
                <span className="inline-block px-2 py-1 rounded-lg bg-slate-700/60 text-xs font-bold text-slate-300">
                  {fmtMonth(m)}
                </span>
              </div>
            ))}
          </div>

          {/* amount row */}
          <div
            className="grid gap-2 mb-1.5"
            style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}
          >
            {months.map((m) => {
              const row = byMonth[m];
              const isSpike = row?.anomaly?.isSpike;
              return (
                <div
                  key={m}
                  className={`rounded-xl px-2 py-2.5 text-center ${
                    isSpike ? "bg-rose-500/10 ring-1 ring-rose-500/30" : "bg-slate-700/30"
                  }`}
                >
                  <p className="text-sm font-bold text-white truncate">
                    {row ? money(row.amount) : <span className="text-slate-600">—</span>}
                  </p>
                  {/* change pct badge */}
                  {row && row.changePct !== null ? (() => {
                    const isUp   = row.changePct > 0.5;
                    const isDown = row.changePct < -0.5;
                    return (
                      <span className={`inline-flex items-center justify-center gap-0.5 mt-1 text-[11px] font-bold ${
                        isUp ? "text-emerald-400" : isDown ? "text-rose-400" : "text-slate-500"
                      }`}>
                        {isUp   ? <ArrowUpRight   className="w-3 h-3" /> :
                         isDown ? <ArrowDownRight className="w-3 h-3" /> :
                                  <Minus          className="w-3 h-3" />}
                        {pct(row.changePct)}
                      </span>
                    );
                  })() : (
                    <span className="inline-flex items-center justify-center mt-1 text-[11px] font-medium text-slate-600">
                      first month
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* mini bar row */}
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}
          >
            {months.map((m) => {
              const row = byMonth[m];
              const pctWidth = row ? Math.min((row.amount / (totalIncome || 1)) * months.length * 100, 100) : 0;
              return (
                <div key={m} className="flex items-center justify-center px-1">
                  <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${pctWidth}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

// ─── axis formatters (stable references, no inline closure) ──────────────────
function yTickFmt(v) { return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`; }

// ─── page ─────────────────────────────────────────────────────────────────────
export default function IncomeAnalyticsPage() {
  const [range,               setRange]               = useState(defaultRange);
  const [activePreset,        setActivePreset]        = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [chartView,           setChartView]           = useState("bar");
  const [sortKey,             setSortKey]             = useState("amount");
  const [sortDir,             setSortDir]             = useState("desc");
  const [showAllRows,         setShowAllRows]         = useState(false);
  const [momSectionOpen,      setMomSectionOpen]      = useState(true);
  const [categorySearch,      setCategorySearch]      = useState("");
  const [showFilters,         setShowFilters]         = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState("");
  const [data, setData] = useState({
    categories: [], months: [], table: [],
    chart: { groupedBars: [], trendLines: [] },
    anomalies: [], summary: { totalRows: 0, anomalyCount: 0 },
  });

  // first-load vs refresh distinction
  const isFirstLoad  = loading && data.months.length === 0;
  const isRefreshing = loading && data.months.length > 0;

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
      totalIncome:  total,
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

  // group filtered table rows by category for the MoM comparison grid
  const categoryMoMGroups = useMemo(() => {
    const map = new Map();
    for (const row of filteredTableRows) {
      if (!map.has(row.categoryId)) {
        map.set(row.categoryId, {
          category: {
            categoryId: row.categoryId,
            categoryName: row.category,
            categoryIcon: row.categoryIcon,
            categoryColor: row.categoryColor,
          },
          rows: [],
        });
      }
      map.get(row.categoryId).rows.push(row);
    }
    // sort categories by total income desc
    return Array.from(map.values()).sort(
      (a, b) =>
        b.rows.reduce((s, r) => s + r.amount, 0) -
        a.rows.reduce((s, r) => s + r.amount, 0)
    );
  }, [filteredTableRows]);

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

  // ── handlers ──────────────────────────────────────────────────────────────────
  const applyPreset = (preset) => {
    const now = new Date();
    if (preset.months === null) {
      setRange({
        startMonth: `${now.getFullYear()}-01`,
        endMonth:   toMonthInput(new Date(now.getFullYear(), now.getMonth(), 1)),
      });
    } else {
      setRange({
        startMonth: toMonthInput(new Date(now.getFullYear(), now.getMonth() - (preset.months - 1), 1)),
        endMonth:   toMonthInput(new Date(now.getFullYear(), now.getMonth(), 1)),
      });
    }
    setActivePreset(preset.label);
  };

  const toggleCategory = (id) =>
    setSelectedCategoryIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // ── searched categories ─────────────────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return availableCategories;
    return availableCategories.filter(
      (c) => c.name.toLowerCase().includes(q)
    );
  }, [availableCategories, categorySearch]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const headers = ["Month", "Category", "Amount", "Change %", "Moving Average", "Anomaly"];
    const rows = sortedTableRows.map((r) => [
      r.month, r.category, r.amount.toFixed(2), r.changePct?.toFixed(2) ?? "",
      r.movingAverage.toFixed(2), r.anomaly?.isSpike ? `Spike (${r.anomaly.severity})` : "Normal",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `income-analytics-${range.startMonth}-to-${range.endMonth}.csv`;
    a.click();
  };

  // ─── shared axis props ────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-18">

      {/* ── sticky page header ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-emerald-300 to-green-400 bg-clip-text text-transparent leading-none">
                Income Analytics
              </h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5 truncate">
                {fmtMonth(range.startMonth)} → {fmtMonth(range.endMonth)}
                &nbsp;·&nbsp;{activeCategories.length} categor{activeCategories.length === 1 ? "y" : "ies"}
                {isRefreshing ? " · Refreshing…" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                showFilters
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300"
                  : "bg-slate-800 border-slate-600 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {selectedCategoryIds.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold">
                  {selectedCategoryIds.length}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={exportCSV}
              disabled={!hasData || isFirstLoad}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-600 bg-slate-800 text-sm font-semibold text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

        {/* ── controls ─────────────────────────────────────────────────────── */}
        {showFilters && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-400/20 p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Filters & Date range</h2>
            {selectedCategoryIds.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                {selectedCategoryIds.length} selected
              </span>
            )}
          </div>

          {/* range row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
            {/* quick presets */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick range</p>
              <div className="flex gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      activePreset === p.label
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/20"
                        : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* start month */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start month</p>
              <input
                type="month"
                value={range.startMonth}
                max={range.endMonth}
                onChange={(e) => { setRange((p) => ({ ...p, startMonth: e.target.value })); setActivePreset(null); }}
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-medium text-slate-200 [color-scheme:dark] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
            </div>

            {/* end month */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End month</p>
              <input
                type="month"
                value={range.endMonth}
                min={range.startMonth}
                onChange={(e) => { setRange((p) => ({ ...p, endMonth: e.target.value })); setActivePreset(null); }}
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-medium text-slate-200 [color-scheme:dark] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
            </div>

            {/* refresh */}
            <div className="flex items-end">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-5">
            {/* header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</p>
                <span className="text-xs text-slate-400">
                  {selectedCategoryIds.length ? `${selectedCategoryIds.length} of ${availableCategories.length}` : "All"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategoryIds(filteredCategories.map((c) => c._id))}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Select all
                </button>
                <span className="text-slate-600 select-none">|</span>
                <button
                  onClick={() => setSelectedCategoryIds([])}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-300 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-600 bg-slate-700/50 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
              {categorySearch && (
                <button
                  onClick={() => setCategorySearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* category pills */}
            {availableCategories.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No income categories found. Create some first.</p>
            ) : filteredCategories.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No categories match your search.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredCategories.map((cat) => {
                  const isActive = selectedCategoryIds.includes(cat._id);
                  const color = cat.color || "#10b981";
                  return (
                    <button key={cat._id} onClick={() => toggleCategory(cat._id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                        isActive ? "border-transparent text-white shadow-md" : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700"
                      }`}
                      style={isActive ? { backgroundColor: color } : undefined}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? "white" : color }} />
                      {cat.icon || ""} {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── error banner ─────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-rose-300 text-sm">Failed to load analytics</p>
              <p className="text-sm text-rose-400 mt-0.5">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-3 text-xs font-bold text-rose-400 underline hover:text-rose-300"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── KPI cards ────────────────────────────────────────────────────── */}
        {isFirstLoad ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={TrendingUp}
              label="Total income in range"
              value={money(kpis.totalIncome)}
              sub={`${data.months.length} month${data.months.length !== 1 ? "s" : ""} · ${activeCategories.length} categor${activeCategories.length !== 1 ? "ies" : "y"}`}
              tone="emerald"
            />
            <KPICard
              icon={BarChart3}
              label="Highest income month"
              value={kpis.peakMonth}
              sub={kpis.peakAmount > 0 ? money(kpis.peakAmount) + " total" : "No data"}
              tone="purple"
            />
            <KPICard
              icon={Zap}
              label="Top income category"
              value={kpis.topCategory}
              sub={kpis.topAmount > 0 ? money(kpis.topAmount) + " total" : "No data"}
              tone="amber"
            />
            <KPICard
              icon={AlertTriangle}
              label="Income anomalies"
              value={String(kpis.anomalyCount)}
              sub={kpis.anomalyCount > 0 ? "Unusual spikes detected — review below" : "No unusual spikes this period"}
              tone={kpis.anomalyCount > 0 ? "rose" : "green"}
              badge={kpis.anomalyCount}
            />
          </div>
        )}

        {/* ── content area: skeleton | empty | data ────────────────────────── */}
        {isFirstLoad ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : !hasData && !error ? (
          /* empty state */
          <div className="bg-slate-800/60 rounded-2xl border border-emerald-400/20 p-16 text-center">
            <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No income data in this range</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              No income was recorded in the selected period. Try adjusting the date range or removing category filters.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-600 bg-slate-700/50 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
                >
                  Try last {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : hasData ? (
          <>
            {/* anomaly alert */}
            <AnomalyAlert anomalies={data.anomalies} />

            {/* ── charts card ────────────────────────────────────────────── */}
            <div className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-400/20 p-6 transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
              {/* header */}
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-white">Income by category</h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Month-on-month breakdown
                    {anomalyMonths.size > 0 && (
                      <span className="ml-2 text-amber-500 font-semibold">
                        — dashed lines mark anomaly months
                      </span>
                    )}
                  </p>
                </div>

                {/* view toggle */}
                <div className="flex items-center bg-slate-700/50 rounded-xl p-1 gap-0.5 flex-shrink-0">
                  {[
                    { key: "bar",  icon: BarChart3,       label: "Bar"  },
                    { key: "line", icon: LineChartIcon,   label: "Line" },
                    { key: "area", icon: Activity,        label: "Area" },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setChartView(v.key)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        chartView === v.key ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      <v.icon className="w-3.5 h-3.5" />
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* too-many-categories hint for bar */}
              {chartView === "bar" && activeCategories.length > 8 && (
                <p className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl">
                  Tip: bar charts are clearest with fewer than 8 categories. Use the category filter above to narrow down.
                </p>
              )}

              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === "bar" ? (
                    <BarChart data={data.chart.groupedBars} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis {...xAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                      {activeCategories.map((cat) => (
                        <Bar
                          key={cat.categoryId}
                          dataKey={cat.categoryName}
                          fill={categoryColor(data.categories, cat.categoryId)}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={44}
                        />
                      ))}
                      {Array.from(anomalyMonths).map((month) => (
                        <ReferenceLine
                          key={month}
                          x={month}
                          stroke="#fcd34d"
                          strokeWidth={1.5}
                          strokeDasharray="5 4"
                        />
                      ))}
                    </BarChart>
                  ) : chartView === "line" ? (
                    <LineChart data={lineChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis {...xAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                      {activeCategories.map((cat) => (
                        <Line
                          key={cat.categoryId}
                          type="monotone"
                          dataKey={cat.categoryName}
                          stroke={categoryColor(data.categories, cat.categoryId)}
                          strokeWidth={2.5}
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          connectNulls
                        />
                      ))}
                      {Array.from(anomalyMonths).map((month) => (
                        <ReferenceLine key={month} x={month} stroke="#fcd34d" strokeWidth={1.5} strokeDasharray="5 4" />
                      ))}
                    </LineChart>
                  ) : (
                    /* area */
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis {...xAxisProps} />
                      <YAxis {...yAxisProps} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                      {activeCategories.map((cat) => {
                        const color = categoryColor(data.categories, cat.categoryId);
                        return (
                          <Area
                            key={cat.categoryId}
                            type="monotone"
                            dataKey={cat.categoryName}
                            stroke={color}
                            strokeWidth={2.5}
                            fill={`url(#igrad-${cat.categoryId})`}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            connectNulls
                          />
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

            {/* ── month-on-month category comparison ─────────────────────── */}
            <div className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-400/20 overflow-hidden transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
              {/* section header */}
              <button
                onClick={() => setMomSectionOpen((p) => !p)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 flex-shrink-0">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <h2 className="text-lg font-bold text-white leading-tight">Month-on-Month Category Comparison</h2>
                    <p className="text-sm text-slate-400 mt-0.5 leading-tight">
                      Each category's income across months — see exactly where earnings are rising or falling
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:inline text-xs font-semibold text-slate-500">
                    {categoryMoMGroups.length} categor{categoryMoMGroups.length !== 1 ? "ies" : "y"} · {data.months.length} month{data.months.length !== 1 ? "s" : ""}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${momSectionOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {momSectionOpen && (
                <div className="border-t border-slate-700/50 px-6 py-5">
                  {/* legend hint */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Green %</span> — income rose vs prior month
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400 font-semibold">Red %</span> — income fell vs prior month
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-rose-500/20 ring-1 ring-rose-500/40" />
                      Highlighted cell = anomaly spike
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      "first month" = no prior month to compare
                    </span>
                  </div>

                  {/* warning when too many months for side-by-side */}
                  {data.months.length > 8 && (
                    <p className="mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl">
                      Tip: showing {data.months.length} months side-by-side can be cramped. Scroll horizontally or reduce the date range to 6 months for the best view.
                    </p>
                  )}

                  <div className="space-y-2.5">
                    {categoryMoMGroups.map((group, i) => (
                      <CategoryMoMCard
                        key={group.category.categoryId}
                        category={group.category}
                        rows={group.rows}
                        months={data.months}
                        defaultOpen={i === 0}
                        range={range}
                      />
                    ))}
                    {categoryMoMGroups.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-6">No data available for the selected filters.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── detailed table ─────────────────────────────────────────── */}
            <div className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-400/20 overflow-hidden transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
              {/* table header */}
              <div className="px-6 py-5 border-b border-slate-700 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-white">Detailed breakdown</h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {filteredTableRows.length} record{filteredTableRows.length !== 1 ? "s" : ""}
                    &nbsp;· click any column header to sort
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Spike</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" />Normal</span>
                  <span className="flex items-center gap-1.5"><span className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-emerald-200 rounded-full" />Relative size</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800/80 border-b border-slate-700">
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
                        <th
                          key={label}
                          onClick={() => key && handleSort(key)}
                          className={`px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${key ? "cursor-pointer hover:text-white select-none" : ""}`}
                        >
                          <span className="flex items-center gap-1">
                            {label}
                            {key && <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-700/30">
                    {visibleRows.map((row) => {
                      const color    = row.categoryColor || categoryColor(data.categories, row.categoryId);
                      const isSpike  = row.anomaly?.isSpike;
                      const barWidth = Math.min((row.amount / maxAmount) * 100, 100);
                      const hasChange = row.changePct !== null;
                      const isUp     = hasChange && row.changePct > 0.5;
                      const isDown   = hasChange && row.changePct < -0.5;
                      return (
                        <tr
                          key={`${row.month}_${row.categoryId}`}
                          className={`transition-colors hover:bg-slate-700/40 ${isSpike ? "bg-amber-500/10" : ""}`}
                        >
                          <td className="px-5 py-3.5 font-semibold text-slate-300 whitespace-nowrap">{fmtMonth(row.month)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                              <span className="font-medium text-white">{row.categoryIcon || ""} {row.category}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-white whitespace-nowrap">{money(row.amount)}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {!hasChange ? (
                              <span className="text-xs text-slate-600 font-medium">first month</span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 font-semibold ${
                                isUp ? "text-emerald-400" : isDown ? "text-rose-400" : "text-slate-500"
                              }`}>
                                {isUp   ? <ArrowUpRight   className="w-3.5 h-3.5" /> :
                                 isDown ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                                          <Minus          className="w-3.5 h-3.5" />}
                                {pct(row.changePct)}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{money(row.movingAverage)}</td>
                          <td className="px-5 py-3.5 w-32">
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden w-24">
                              <div
                                className="h-1.5 rounded-full transition-all duration-700"
                                style={{ width: `${barWidth}%`, backgroundColor: color }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {isSpike ? (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                row.anomaly.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-yellow-500/20 text-yellow-400"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${row.anomaly.severity === "high" ? "bg-amber-500" : "bg-yellow-500"}`} />
                                Spike · {row.anomaly.severity}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredTableRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center">
                          <p className="text-slate-400 font-medium">No records match the current filters.</p>
                          <button onClick={() => setSelectedCategoryIds([])} className="mt-2 text-sm text-emerald-400 hover:underline">
                            Clear category filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {/* totals footer */}
                  {filteredTableRows.length > 0 && (
                    <tfoot className="bg-slate-800/80 border-t border-slate-700">
                      <tr>
                        <td colSpan={2} className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Total ({filteredTableRows.length} rows)
                        </td>
                        <td className="px-5 py-3.5 font-bold text-white">
                          {money(filteredTableRows.reduce((s, r) => s + r.amount, 0))}
                        </td>
                        <td colSpan={4} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* show more / less */}
              {sortedTableRows.length > 20 && (
                <div className="px-6 py-4 border-t border-slate-700 text-center bg-slate-800/40">
                  <button
                    onClick={() => setShowAllRows((p) => !p)}
                    className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
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
