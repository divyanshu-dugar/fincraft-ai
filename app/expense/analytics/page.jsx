"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
  PieChart as PieChartIcon,
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
  "#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ef4444", "#14b8a6", "#f97316", "#6366f1",
  "#ec4899", "#84cc16", "#06b6d4", "#a78bfa",
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

/** Build display label: "Parent › Sub" or just name if it's a parent category */
function categoryLabel(cat) {
  if (!cat) return 'Unknown';
  return cat.parentName ? `${cat.parentName} › ${cat.categoryName}` : cat.categoryName;
}

// ─── skeleton pieces ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
      <div className="h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded w-20 mb-1" />
      <div className="h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded w-24" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 p-6 animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
      <div className="h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded w-72 mb-8" />
      <div className="h-[340px] bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
const TONES = {
  blue:    { bg: "bg-slate-800/60",    border: "border-blue-500/30",    icon: "bg-blue-500/20 text-blue-400"    },
  emerald: { bg: "bg-slate-800/60",    border: "border-emerald-500/30", icon: "bg-emerald-500/20 text-emerald-400" },
  rose:    { bg: "bg-slate-800/60",    border: "border-rose-500/30",    icon: "bg-rose-500/20 text-rose-400"    },
  amber:   { bg: "bg-slate-800/60",    border: "border-amber-500/30",   icon: "bg-amber-500/20 text-amber-400"  },
  purple:  { bg: "bg-slate-800/60",    border: "border-purple-500/30",  icon: "bg-purple-500/20 text-purple-400" },
};

function KPICard({ icon: Icon, label, value, sub, tone = "blue", badge }) {
  const t = TONES[tone] || TONES.blue;
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
      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate">{value}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{label}</p>
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
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-500/20 rounded-xl mt-0.5 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="font-bold text-rose-300 text-sm">
              {anomalies.length} unusual spending spike{anomalies.length > 1 ? "s" : ""} detected in this period
            </p>
            {anomalies.length > 3 && (
              <button onClick={() => setExpanded((p) => !p)} className="text-xs font-semibold text-rose-400 hover:underline flex-shrink-0">
                {expanded ? "Show less" : `+${anomalies.length - 3} more`}
              </button>
            )}
          </div>
          <p className="text-xs text-rose-400 mt-1 mb-3">
            These categories spent significantly more than their trailing 3-month average.
          </p>
          <div className="space-y-2">
            {shown.map((row, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl px-4 py-2.5 text-sm border border-rose-500/20">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.anomaly?.severity === "high" ? "bg-rose-500" : "bg-amber-500"}`} />
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {row.parentIcon && `${row.parentIcon} `}{row.parentName ? `${row.parentName} › ` : ""}{row.categoryIcon || ""} {row.category}
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-xs flex-shrink-0">{fmtMonth(row.month)}</span>
                {row.anomaly?.reason && (
                  <span className="text-slate-600 dark:text-slate-400 text-xs hidden md:block truncate flex-1">{row.anomaly.reason}</span>
                )}
                <span className="ml-auto font-bold text-rose-400 flex-shrink-0">{money(row.amount)}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  row.anomaly?.severity === "high" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
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
    <div className="bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-2xl p-4 min-w-[200px] max-w-[260px]">
      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">{fmtMonth(label)}</p>
      <div className="space-y-1.5">
        {sorted.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || item.fill || item.stroke }} />
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{item.dataKey}</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{money(item.value)}</span>
          </div>
        ))}
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{money(total)}</span>
        </div>
      )}
    </div>
  );
}

// ─── category legend panel ────────────────────────────────────────────────────
function CategoryLegend({ groups, depth, total, expanded, onToggle, formatMoney }) {
  if (!groups.length) return null;
  const itemCount = depth === 'parent' ? groups.length : groups.reduce((s, g) => s + g.children.length, 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Breakdown</p>
        <span className="text-xs text-slate-500 font-medium">{itemCount} {depth === 'parent' ? 'categories' : 'subcategories'}</span>
      </div>

      {depth === 'parent' ? (
        /* ── flat parent list ── */
        <div className="space-y-3">
          {groups.map((item) => {
            const pctVal = total > 0 ? (item.total / total * 100) : 0;
            return (
              <div key={item.name}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white/10" style={{ backgroundColor: item.color }} />
                  {item.icon && <span className="text-sm flex-shrink-0">{item.icon}</span>}
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">{item.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex-shrink-0 tabular-nums">{formatMoney(item.total)}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold flex-shrink-0 w-10 text-right tabular-nums">{pctVal.toFixed(0)}%</span>
                </div>
                <div className="ml-[22px] h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pctVal}%`, backgroundColor: item.color }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── grouped sub list with collapsible parents ── */
        <div className="space-y-2">
          {groups.map((group, gi) => {
            const pctVal = total > 0 ? (group.total / total * 100) : 0;
            const isOpen = expanded[group.name] ?? (gi < 3);
            return (
              <div key={group.name} className="rounded-xl border border-slate-300/40 dark:border-slate-700/40 bg-slate-100/30 dark:bg-slate-800/30 overflow-hidden">
                <button
                  onClick={() => onToggle(group.name)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-200/20 dark:bg-slate-700/20 transition-colors"
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white/10" style={{ backgroundColor: group.color }} />
                  {group.icon && <span className="text-sm flex-shrink-0">{group.icon}</span>}
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate flex-1 text-left">{group.name}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex-shrink-0 tabular-nums">{formatMoney(group.total)}</span>
                  <span className="text-[10px] text-slate-500 font-bold flex-shrink-0 w-9 text-right tabular-nums">{pctVal.toFixed(0)}%</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-300/30 dark:border-slate-700/30 px-3 py-2.5 space-y-2">
                    {group.children.map((child) => {
                      const childPct = group.total > 0 ? (child.value / group.total * 100) : 0;
                      return (
                        <div key={child.name} className="flex items-center gap-2 pl-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: child.color }} />
                          {child.icon && <span className="text-xs flex-shrink-0">{child.icon}</span>}
                          <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1">{child.name}</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex-shrink-0 tabular-nums">{formatMoney(child.value)}</span>
                          <div className="w-14 h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden flex-shrink-0">
                            <div className="h-full rounded-full" style={{ width: `${childPct}%`, backgroundColor: child.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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

  const totalSpend = rows.reduce((s, r) => s + r.amount, 0);
  const bestMonth  = rows.reduce((best, r) => (r.amount > (best?.amount ?? -1) ? r : best), null);
  const spikeCount = rows.filter((r) => r.anomaly?.isSpike).length;

  return (
    <div className="rounded-2xl border border-slate-300/60 dark:border-slate-700/60 bg-slate-100/50 dark:bg-slate-800/50 overflow-hidden">
      {/* ── category header (always visible) ── */}
      <div className="flex items-center hover:bg-slate-200/30 dark:bg-slate-700/30 transition-colors group">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex-1 flex items-center gap-4 px-5 py-4 text-left min-w-0"
        >
          {/* color dot + name */}
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {category.parentName && (
                <span className="text-xs text-slate-500 font-medium">
                  {category.parentIcon} {category.parentName} ›
                </span>
              )}
              <span className="text-sm font-bold text-slate-900 dark:text-white">
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
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">{money(totalSpend)}</span>
            <span>total</span>
            {bestMonth && (
              <>
                <span className="text-slate-600">·</span>
                <span>peak: <span className="font-semibold text-slate-700 dark:text-slate-300">{fmtMonth(bestMonth.month)}</span></span>
              </>
            )}
          </div>

          {/* chevron */}
          <ChevronDown
            className={`w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
                `/expense/list?category=${category.categoryId}&startDate=${startDate}&endDate=${endDate}`
              );
            }}
            className="flex-shrink-0 p-1.5 mr-3 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            title="View expenses in list"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── months grid (expandable) ── */}
      {open && (
        <div className="border-t border-slate-300/50 dark:border-slate-700/50 px-5 py-4">
          {/* month column headers */}
          <div
            className="grid gap-2 mb-2"
            style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}
          >
            {months.map((m) => (
              <div key={m} className="text-center">
                <span className="inline-block px-2 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
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
                    isSpike ? "bg-rose-500/10 ring-1 ring-rose-500/30" : "bg-slate-200/30 dark:bg-slate-700/30"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {row ? money(row.amount) : <span className="text-slate-600">—</span>}
                  </p>
                  {/* change pct badge */}
                  {row && row.changePct !== null ? (() => {
                    const isUp   = row.changePct > 0.5;
                    const isDown = row.changePct < -0.5;
                    return (
                      <span className={`inline-flex items-center justify-center gap-0.5 mt-1 text-[11px] font-bold ${
                        isUp ? "text-rose-400" : isDown ? "text-emerald-400" : "text-slate-500"
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
              const pctWidth = row ? Math.min((row.amount / (totalSpend || 1)) * months.length * 100, 100) : 0;
              return (
                <div key={m} className="flex items-center justify-center px-1">
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
    ? <ChevronUp   className="w-3.5 h-3.5 text-blue-500" />
    : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
}

// ─── axis formatters (stable references, no inline closure) ──────────────────
function yTickFmt(v) { return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`; }

// ─── page ─────────────────────────────────────────────────────────────────────
export default function ExpenseAnalyticsPage() {
  const [range,               setRange]               = useState(defaultRange);
  const [activePreset,        setActivePreset]        = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [chartView,           setChartView]           = useState("pie"); // "pie" | "bar"
  const [categoryDepth,       setCategoryDepth]       = useState("parent"); // "parent" | "sub"
  const [legendExpanded,      setLegendExpanded]      = useState({});
  const [sortKey,             setSortKey]             = useState("amount");
  const [sortDir,             setSortDir]             = useState("desc");
  const [momSectionOpen,      setMomSectionOpen]      = useState(true);
  const [categorySearch,      setCategorySearch]      = useState("");
  const [collapsedGroups,     setCollapsedGroups]     = useState({});
  const [showFilters,         setShowFilters]         = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState("");
  const [data, setData] = useState({
    categories: [], months: [], table: [],
    chart: { groupedBars: [], trendLines: [] },
    anomalies: [], summary: { totalRows: 0, anomalyCount: 0 },
  });

  // first-load vs refresh distinction
  const isFirstLoad = loading && data.months.length === 0;
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

  const kpis = useMemo(() => {
    const total = filteredTableRows.reduce((s, r) => s + r.amount, 0);
    const monthMap = {};
    const catMap   = {};
    for (const r of filteredTableRows) {
      monthMap[r.month]    = (monthMap[r.month]    || 0) + r.amount;
      const catLabel = r.parentName ? `${r.parentName} › ${r.category}` : r.category;
      catMap[catLabel]      = (catMap[catLabel]      || 0) + r.amount;
    }
    const peakEntry = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];
    const topCat    = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    return {
      totalSpend:   total,
      peakMonth:    peakEntry ? fmtMonth(peakEntry[0]) : "—",
      peakAmount:   peakEntry?.[1] || 0,
      topCategory:  topCat?.[0] || "—",
      topAmount:    topCat?.[1] || 0,
      anomalyCount: data.summary?.anomalyCount || 0,
    };
  }, [filteredTableRows, data.summary]);

  // ── parent-level aggregation ──────────────────────────────────────────────
  const pieDataParent = useMemo(() => {
    const totals = new Map();
    for (const row of filteredTableRows) {
      const parent = row.parentName || row.category;
      const existing = totals.get(parent);
      if (!existing) {
        totals.set(parent, {
          name: parent,
          value: row.amount,
          icon: row.parentIcon || row.categoryIcon || '',
        });
      } else {
        existing.value += row.amount;
      }
    }
    const sorted = Array.from(totals.values()).sort((a, b) => b.value - a.value);
    return sorted.map((item, i) => ({ ...item, color: COLORS[i % COLORS.length] }));
  }, [filteredTableRows]);

  // ── sub-level aggregation ────────────────────────────────────────────────
  const pieDataSub = useMemo(() => {
    const totals = new Map();
    for (const row of filteredTableRows) {
      const key = row.categoryId;
      const existing = totals.get(key);
      if (!existing) {
        totals.set(key, {
          name: row.category,
          value: row.amount,
          color: row.categoryColor || COLORS[totals.size % COLORS.length],
          parent: row.parentName || row.category,
          parentIcon: row.parentIcon || row.categoryIcon || '',
          icon: row.categoryIcon || '',
        });
      } else {
        existing.value += row.amount;
      }
    }
    return Array.from(totals.values()).sort((a, b) => b.value - a.value);
  }, [filteredTableRows]);

  // ── active data based on depth ───────────────────────────────────────────
  const activePieData = categoryDepth === 'parent' ? pieDataParent : pieDataSub;
  const pieTotal = activePieData.reduce((s, d) => s + d.value, 0);

  // ── legend groups (subcategories organized under parents) ────────────────
  const legendGroups = useMemo(() => {
    const groups = new Map();
    for (const item of pieDataSub) {
      const parent = item.parent;
      if (!groups.has(parent)) {
        const parentItem = pieDataParent.find((p) => p.name === parent);
        groups.set(parent, {
          name: parent,
          icon: item.parentIcon,
          color: parentItem?.color || COLORS[groups.size % COLORS.length],
          total: parentItem?.value || 0,
          children: [],
        });
      }
      groups.get(parent).children.push(item);
    }
    return Array.from(groups.values()).sort((a, b) => b.total - a.total);
  }, [pieDataSub, pieDataParent]);

  // ── bar data aggregated by parent ────────────────────────────────────────
  const barDataParent = useMemo(() => {
    const subParentMap = new Map();
    for (const row of filteredTableRows) {
      subParentMap.set(row.category, row.parentName || row.category);
    }
    return (data.chart.groupedBars || []).map((monthRow) => {
      const newRow = { month: monthRow.month };
      for (const [key, value] of Object.entries(monthRow)) {
        if (key === 'month') continue;
        const parent = subParentMap.get(key) || key;
        newRow[parent] = (newRow[parent] || 0) + (value || 0);
      }
      return newRow;
    });
  }, [data.chart.groupedBars, filteredTableRows]);

  const toggleLegendGroup = (name) =>
    setLegendExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

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
            parentName: row.parentName,
            parentIcon: row.parentIcon,
          },
          rows: [],
        });
      }
      map.get(row.categoryId).rows.push(row);
    }
    // sort categories by total spend desc
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        // flatten tree into filter-friendly list with parent info
        const flat = [];
        for (const parent of json.tree || []) {
          for (const sub of parent.subcategories || []) {
            flat.push({
              _id: sub._id,
              name: sub.name,
              icon: sub.icon,
              color: sub.color || parent.color,
              parentName: parent.name,
              parentIcon: parent.icon,
            });
          }
          // include parent itself if it has no subcategories (edge case)
          if (!parent.subcategories?.length) {
            flat.push({
              _id: parent._id,
              name: parent.name,
              icon: parent.icon,
              color: parent.color,
              parentName: null,
              parentIcon: null,
            });
          }
        }
        setAvailableCategories(flat);
      }
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
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/analytics/category-month-comparison?${params}`,
        { headers: { Authorization: `jwt ${token}` } }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load analytics");
      }
      setData(await res.json());
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
      // Year-to-date: Jan 1 of this year → current month
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

  const toggleGroup = (groupName) =>
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));

  // ── grouped + searched categories ───────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return availableCategories;
    return availableCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.parentName && c.parentName.toLowerCase().includes(q))
    );
  }, [availableCategories, categorySearch]);

  const groupedCategories = useMemo(() => {
    const map = new Map();
    for (const cat of filteredCategories) {
      const key = cat.parentName || cat.name;
      if (!map.has(key)) map.set(key, { parentName: key, parentIcon: cat.parentIcon || cat.icon || "", items: [] });
      map.get(key).items.push(cat);
    }
    return Array.from(map.values());
  }, [filteredCategories]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const headers = ["Month", "Parent Category", "Category", "Amount", "Change %", "Moving Average", "Anomaly"];
    const rows = sortedTableRows.map((r) => [
      r.month, r.parentName || "", r.category, r.amount.toFixed(2), r.changePct.toFixed(2),
      r.movingAverage.toFixed(2), r.anomaly?.isSpike ? `Spike (${r.anomaly.severity})` : "Normal",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `expense-analytics-${range.startMonth}-to-${range.endMonth}.csv`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 py-18">

      {/* ── sticky page header ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-300/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Activity className="w-5 h-5 text-slate-900 dark:text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-300 to-indigo-400 bg-clip-text text-transparent leading-none">
                Expense Analytics
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-none mt-0.5 truncate">
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
                  ? "bg-blue-500/20 border-blue-400/60 text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {selectedCategoryIds.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-xs font-bold">
                  {selectedCategoryIds.length}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={exportCSV}
              disabled={!hasData || isFirstLoad}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-600 bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div className="bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-cyan-400/20 p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Filters & Date range</h2>
            {selectedCategoryIds.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                {selectedCategoryIds.length} selected
              </span>
            )}
          </div>

          {/* range row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
            {/* quick presets */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Quick range</p>
              <div className="flex gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      activePreset === p.label
                        ? "border-blue-400 bg-blue-500/20 text-blue-300 shadow-sm shadow-blue-500/20"
                        : "border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* start month */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Start month</p>
              <input
                type="month"
                value={range.startMonth}
                max={range.endMonth}
                onChange={(e) => { setRange((p) => ({ ...p, startMonth: e.target.value })); setActivePreset(null); }}
                className="w-full rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 [color-scheme:dark] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>

            {/* end month */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">End month</p>
              <input
                type="month"
                value={range.endMonth}
                min={range.startMonth}
                onChange={(e) => { setRange((p) => ({ ...p, endMonth: e.target.value })); setActivePreset(null); }}
                className="w-full rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 [color-scheme:dark] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>

            {/* refresh */}
            <div className="flex items-end">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-300/50 dark:border-slate-700/50 pt-5">
            {/* header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Categories</p>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedCategoryIds.length ? `${selectedCategoryIds.length} of ${availableCategories.length}` : "All"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategoryIds(filteredCategories.map((c) => c._id))}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Select all
                </button>
                <span className="text-slate-600 select-none">|</span>
                <button
                  onClick={() => setSelectedCategoryIds([])}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:underline"
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
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
              {categorySearch && (
                <button
                  onClick={() => setCategorySearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* grouped category list */}
            {availableCategories.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">No expense categories found. Create some first.</p>
            ) : groupedCategories.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">No categories match your search.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {groupedCategories.map((group) => {
                  const isCollapsed = collapsedGroups[group.parentName];
                  const groupSelected = group.items.filter((c) => selectedCategoryIds.includes(c._id)).length;
                  const allSelected = groupSelected === group.items.length;
                  const someSelected = groupSelected > 0 && !allSelected;
                  return (
                    <div key={group.parentName} className="rounded-xl border border-slate-300/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/40 overflow-hidden">
                      {/* group header */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-100/60 dark:bg-slate-800/60">
                        <button
                          onClick={() => toggleGroup(group.parentName)}
                          className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        >
                          {group.parentIcon && <span className="text-sm flex-shrink-0">{group.parentIcon}</span>}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{group.parentName}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">
                            ({group.items.length})
                          </span>
                          {someSelected && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex-shrink-0">
                              {groupSelected}
                            </span>
                          )}
                          {allSelected && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex-shrink-0">
                              All
                            </span>
                          )}
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-auto transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`} />
                        </button>
                        {/* toggle whole group */}
                        <button
                          onClick={() => {
                            const groupIds = group.items.map((c) => c._id);
                            if (allSelected) {
                              setSelectedCategoryIds((prev) => prev.filter((id) => !groupIds.includes(id)));
                            } else {
                              setSelectedCategoryIds((prev) => Array.from(new Set([...prev, ...groupIds])));
                            }
                          }}
                          className={`ml-3 text-xs font-semibold flex-shrink-0 transition-colors ${
                            allSelected ? "text-slate-500 hover:text-slate-700 dark:text-slate-300" : "text-blue-400 hover:text-blue-300"
                          }`}
                        >
                          {allSelected ? "Deselect" : "Select all"}
                        </button>
                      </div>

                      {/* category pills */}
                      {!isCollapsed && (
                        <div className="flex flex-wrap gap-1.5 p-3">
                          {group.items.map((cat) => {
                            const isActive = selectedCategoryIds.includes(cat._id);
                            const color = cat.color || "#9CA3AF";
                            return (
                              <button
                                key={cat._id}
                                onClick={() => toggleCategory(cat._id)}
                                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
                                  isActive
                                    ? "border-transparent text-slate-900 dark:text-white shadow-sm"
                                    : "border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:text-slate-900 dark:text-white"
                                }`}
                                style={isActive ? { backgroundColor: color } : undefined}
                              >
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: isActive ? "white" : color }} />
                                {cat.icon && <span>{cat.icon}</span>}
                                <span>{cat.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
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

        {/* ── KPI cards — always visible —────────────────────────────────── */}
        {isFirstLoad ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={TrendingUp}
              label="Total spend in range"
              value={money(kpis.totalSpend)}
              sub={`${data.months.length} month${data.months.length !== 1 ? "s" : ""} · ${activeCategories.length} categor${activeCategories.length !== 1 ? "ies" : "y"}`}
              tone="blue"
            />
            <KPICard
              icon={BarChart3}
              label="Highest spending month"
              value={kpis.peakMonth}
              sub={kpis.peakAmount > 0 ? money(kpis.peakAmount) + " total" : "No data"}
              tone="purple"
            />
            <KPICard
              icon={Zap}
              label="Top category"
              value={kpis.topCategory}
              sub={kpis.topAmount > 0 ? money(kpis.topAmount) + " total" : "No data"}
              tone="amber"
            />
            <KPICard
              icon={AlertTriangle}
              label="Spending anomalies"
              value={String(kpis.anomalyCount)}
              sub={kpis.anomalyCount > 0 ? "Sudden spikes detected — review below" : "No unusual spikes this period"}
              tone={kpis.anomalyCount > 0 ? "rose" : "emerald"}
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
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 p-16 text-center">
            <div className="w-16 h-16 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No expense data in this range</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
              No expenses were logged in the selected period. Try adjusting the date range or removing category filters.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.months)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
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
            <div className={`bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-cyan-400/20 p-6 transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
              {/* header */}
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Spending by category</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {categoryDepth === 'parent' ? 'Aggregated by main category' : 'Detailed subcategory breakdown'}
                    {chartView === 'bar' && anomalyMonths.size > 0 && (
                      <span className="ml-2 text-rose-500 font-semibold">
                        — dashed lines mark anomaly months
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {/* depth toggle */}
                  <div className="flex items-center bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-1 gap-0.5">
                    {[
                      { key: "parent", label: "Main" },
                      { key: "sub",    label: "Sub" },
                    ].map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setCategoryDepth(v.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          categoryDepth === v.key
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  {/* chart type toggle */}
                  <div className="flex items-center bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-1 gap-0.5">
                    {[
                      { key: "pie",  icon: PieChartIcon, label: "Pie"  },
                      { key: "bar",  icon: BarChart3,     label: "Bar"  },
                    ].map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setChartView(v.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          chartView === v.key ? "bg-slate-600 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <v.icon className="w-3.5 h-3.5" />
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* too-many hint */}
              {chartView === "bar" && categoryDepth === 'sub' && activeCategories.length > 8 && (
                <p className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl">
                  Tip: bar charts are clearest with fewer than 8 categories. Use the category filter above to narrow down.
                </p>
              )}

              {/* chart + legend side-by-side */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* chart */}
                <div className="flex-1 min-w-0">
                  <div className={chartView === 'pie' ? 'h-[360px]' : 'h-[380px]'} style={{ width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartView === "pie" ? (
                        <PieChart>
                          <Pie
                            data={activePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={categoryDepth === 'parent' ? 140 : 130}
                            paddingAngle={categoryDepth === 'parent' ? 3 : 1.5}
                            dataKey="value"
                            nameKey="name"
                            stroke="#0f172a"
                            strokeWidth={2}
                            animationBegin={0}
                            animationDuration={600}
                          >
                            {activePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const item = payload[0];
                              const pctVal = pieTotal > 0 ? ((item.value / pieTotal) * 100).toFixed(1) : '0';
                              return (
                                <div className="bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-2xl p-4 min-w-[180px] shadow-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.payload?.color || item.color }} />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Amount</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{money(item.value)}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 mt-1">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Share</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{pctVal}%</span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      ) : (
                        <BarChart
                          data={categoryDepth === 'parent' ? barDataParent : data.chart.groupedBars}
                          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis {...xAxisProps} />
                          <YAxis {...yAxisProps} />
                          <Tooltip content={<ChartTooltip />} />
                          {categoryDepth === 'parent'
                            ? pieDataParent.map((p, i) => (
                                <Bar
                                  key={p.name}
                                  dataKey={p.name}
                                  fill={p.color || COLORS[i % COLORS.length]}
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={48}
                                />
                              ))
                            : activeCategories.map((cat) => (
                                <Bar
                                  key={cat.categoryId}
                                  dataKey={cat.categoryName}
                                  fill={categoryColor(data.categories, cat.categoryId)}
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={44}
                                />
                              ))
                          }
                          {Array.from(anomalyMonths).map((month) => (
                            <ReferenceLine
                              key={month}
                              x={month}
                              stroke="#fca5a5"
                              strokeWidth={1.5}
                              strokeDasharray="5 4"
                            />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  {/* center stat inside donut */}
                  {chartView === 'pie' && (
                    <div className="text-center -mt-4 mb-2 lg:mb-0">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{money(pieTotal)}</p>
                      <p className="text-xs text-slate-500 font-medium">Total spend</p>
                    </div>
                  )}
                </div>

                {/* legend panel */}
                <div className="w-full lg:w-72 xl:w-80 lg:max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  <CategoryLegend
                    groups={legendGroups}
                    depth={categoryDepth}
                    total={pieTotal}
                    expanded={legendExpanded}
                    onToggle={toggleLegendGroup}
                    formatMoney={money}
                  />
                </div>
              </div>
            </div>

            {/* ── month-on-month category comparison ─────────────────────── */}
            <div className={`bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-cyan-400/20 overflow-hidden transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
              {/* section header */}
              <button
                onClick={() => setMomSectionOpen((p) => !p)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-slate-200/20 dark:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 flex-shrink-0">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Month-on-Month Category Comparison</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                      Each category's spend across months — see exactly where costs are rising or falling
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:inline text-xs font-semibold text-slate-500">
                    {categoryMoMGroups.length} categor{categoryMoMGroups.length !== 1 ? "ies" : "y"} · {data.months.length} month{data.months.length !== 1 ? "s" : ""}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${momSectionOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {momSectionOpen && (
                <div className="border-t border-slate-300/50 dark:border-slate-700/50 px-6 py-5">
                  {/* legend hint */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400 font-semibold">Red %</span> — spending rose vs prior month
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Green %</span> — spending fell vs prior month
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
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">No data available for the selected filters.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
