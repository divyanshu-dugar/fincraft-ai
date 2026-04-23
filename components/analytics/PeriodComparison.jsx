"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  GitCompare,
  Layers,
  Minus,
  TrendingUp,
} from "lucide-react";

// ─── utilities ────────────────────────────────────────────────────────────────
function money(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function moneyDetailed(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v || 0);
}

function pctChange(curr, prev) {
  if (!prev || prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function fmtMonth(yyyyMM) {
  if (!yyyyMM || !yyyyMM.includes("-")) return yyyyMM || "";
  const [y, m] = yyyyMM.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", {
    month: "short",
  });
}

function fmtMonthFull(yyyyMM) {
  if (!yyyyMM || !yyyyMM.includes("-")) return yyyyMM || "";
  const [y, m] = yyyyMM.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function yTickFmt(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
}

// ─── Change badge sub-component ───────────────────────────────────────────────
function ChangeBadge({ value, inverted = false }) {
  if (value === null || value === undefined || isNaN(value)) return <span className="text-xs text-slate-500">—</span>;
  const isUp = value > 0.5;
  const isDown = value < -0.5;
  // For expenses: up = bad (rose), down = good (emerald)
  // For income: up = good (emerald), down = bad (rose)
  const upColor = inverted ? "text-emerald-400" : "text-rose-400";
  const downColor = inverted ? "text-rose-400" : "text-emerald-400";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold ${
        isUp ? upColor : isDown ? downColor : "text-slate-500"
      }`}
    >
      {isUp ? (
        <ArrowUpRight className="w-3.5 h-3.5" />
      ) : isDown ? (
        <ArrowDownRight className="w-3.5 h-3.5" />
      ) : (
        <Minus className="w-3.5 h-3.5" />
      )}
      {value >= 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ComparisonTooltip({ active, payload, label, periodALabel, periodBLabel, accentA, accentB }) {
  if (!active || !payload?.length) return null;
  const a = payload.find((p) => p.dataKey === "periodA");
  const b = payload.find((p) => p.dataKey === "periodB");
  const valA = a?.value || 0;
  const valB = b?.value || 0;
  const diff = valA - valB;
  const change = pctChange(valA, valB);
  return (
    <div className="bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-2xl p-4 min-w-[220px] shadow-xl">
      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
        {label}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentA }} />
            <span className="text-sm text-slate-600 dark:text-slate-400">{periodALabel}</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{moneyDetailed(valA)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentB }} />
            <span className="text-sm text-slate-600 dark:text-slate-400">{periodBLabel}</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{moneyDetailed(valB)}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">Change</span>
        <span className={`text-sm font-bold ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {diff >= 0 ? "+" : ""}
          {moneyDetailed(diff)} ({change >= 0 ? "+" : ""}{change.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @param {Object} props
 * @param {Array}  props.tableRows   - filtered table rows from analytics data: [{month, category, categoryId, amount, ...}]
 * @param {Array}  props.months      - sorted YYYY-MM strings
 * @param {"expense"|"income"} props.kind
 */
export default function PeriodComparison({ tableRows, months, kind = "expense" }) {
  const [sectionOpen, setSectionOpen] = useState(true);
  const [mode, setMode] = useState("mom"); // "mom" | "yoy"

  const isExpense = kind === "expense";
  const accent = isExpense ? "blue" : "emerald";
  const accentA = isExpense ? "#3b82f6" : "#10b981";
  const accentB = isExpense ? "#8b5cf6" : "#34d399";

  // ── build month-over-month data ───────────────────────────────────────────
  const momData = useMemo(() => {
    if (months.length < 2) return { chart: [], table: [] };
    // aggregate total per month
    const monthTotals = {};
    for (const r of tableRows) {
      monthTotals[r.month] = (monthTotals[r.month] || 0) + r.amount;
    }

    const chart = [];
    const table = [];
    for (let i = 1; i < months.length; i++) {
      const curr = months[i];
      const prev = months[i - 1];
      const currAmt = monthTotals[curr] || 0;
      const prevAmt = monthTotals[prev] || 0;
      const change = pctChange(currAmt, prevAmt);
      const diff = currAmt - prevAmt;
      chart.push({
        label: fmtMonth(curr),
        periodA: currAmt,
        periodB: prevAmt,
        month: curr,
      });
      table.push({
        month: curr,
        prevMonth: prev,
        current: currAmt,
        previous: prevAmt,
        diff,
        changePct: change,
      });
    }
    return { chart, table };
  }, [tableRows, months]);

  // ── build year-over-year data ─────────────────────────────────────────────
  const yoyData = useMemo(() => {
    // aggregate per month
    const monthTotals = {};
    for (const r of tableRows) {
      monthTotals[r.month] = (monthTotals[r.month] || 0) + r.amount;
    }

    // group months by calendar month (01-12), collect years
    const byCalMonth = {}; // { "01": { "2025": 1200, "2026": 1500 } }
    const yearSet = new Set();
    for (const m of months) {
      const [y, cm] = m.split("-");
      yearSet.add(y);
      if (!byCalMonth[cm]) byCalMonth[cm] = {};
      byCalMonth[cm][y] = monthTotals[m] || 0;
    }

    const years = Array.from(yearSet).sort();
    if (years.length < 2) return { chart: [], table: [], years: [] };

    const calMonths = Object.keys(byCalMonth).sort();
    const chart = [];
    const table = [];

    // compare the two most recent years
    const currYear = years[years.length - 1];
    const prevYear = years[years.length - 2];

    for (const cm of calMonths) {
      const currAmt = byCalMonth[cm]?.[currYear] || 0;
      const prevAmt = byCalMonth[cm]?.[prevYear] || 0;
      // Only include if at least one year has data
      if (currAmt === 0 && prevAmt === 0) continue;
      const change = pctChange(currAmt, prevAmt);
      const diff = currAmt - prevAmt;
      const monthLabel = fmtMonth(`${currYear}-${cm}`);
      chart.push({
        label: monthLabel,
        periodA: currAmt,
        periodB: prevAmt,
        month: cm,
      });
      table.push({
        monthLabel,
        calMonth: cm,
        current: currAmt,
        previous: prevAmt,
        diff,
        changePct: change,
        currYear,
        prevYear,
      });
    }
    return { chart, table, years, currYear, prevYear };
  }, [tableRows, months]);

  const activeData = mode === "mom" ? momData : yoyData;
  const periodALabel = mode === "mom" ? "Current month" : (yoyData.currYear || "Current year");
  const periodBLabel = mode === "mom" ? "Previous month" : (yoyData.prevYear || "Previous year");
  const hasYoyData = yoyData.years?.length >= 2;

  // ── summary stats ─────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const rows = activeData.table;
    if (!rows.length) return null;
    const totalCurr = rows.reduce((s, r) => s + r.current, 0);
    const totalPrev = rows.reduce((s, r) => s + r.previous, 0);
    const overallChange = pctChange(totalCurr, totalPrev);
    const bestRow = [...rows].sort((a, b) => b.changePct - a.changePct)[0];
    const worstRow = [...rows].sort((a, b) => a.changePct - b.changePct)[0];
    const growthCount = rows.filter((r) => r.changePct > 0.5).length;
    const declineCount = rows.filter((r) => r.changePct < -0.5).length;
    return { totalCurr, totalPrev, overallChange, bestRow, worstRow, growthCount, declineCount, count: rows.length };
  }, [activeData]);

  if (months.length < 2) return null;

  const borderColor = isExpense ? "border-cyan-400/20" : "border-emerald-400/20";
  const iconBg = isExpense ? "bg-blue-500/15 text-blue-400" : "bg-emerald-500/15 text-emerald-400";

  return (
    <div className={`bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border ${borderColor} overflow-hidden`}>
      {/* ── section header ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setSectionOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-slate-200/20 dark:hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-xl ${iconBg} flex-shrink-0`}>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Period Comparison
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
              Compare {isExpense ? "spending" : "income"} month-over-month and year-over-year
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 transition-transform duration-200 ${sectionOpen ? "rotate-180" : ""}`}
        />
      </button>

      {sectionOpen && (
        <div className="border-t border-slate-300/50 dark:border-slate-700/50 px-6 py-5 space-y-6">
          {/* ── mode toggle ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-1 gap-0.5">
              {[
                { key: "mom", icon: GitCompare, label: "Month vs Month" },
                { key: "yoy", icon: Calendar, label: "Year vs Year" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setMode(v.key)}
                  disabled={v.key === "yoy" && !hasYoyData}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                    mode === v.key
                      ? `bg-gradient-to-r ${isExpense ? "from-blue-600 to-indigo-600" : "from-emerald-500 to-green-600"} text-white shadow-sm`
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  {v.label}
                </button>
              ))}
            </div>
            {mode === "yoy" && !hasYoyData && (
              <p className="text-xs text-amber-400">Need data spanning 2+ years for year-over-year comparison</p>
            )}
            {summary && (
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{summary.count} period{summary.count !== 1 ? "s" : ""}</span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className={summary.overallChange >= 0 ? (isExpense ? "text-rose-400" : "text-emerald-400") : (isExpense ? "text-emerald-400" : "text-rose-400")}>
                    {summary.overallChange >= 0 ? "+" : ""}{summary.overallChange.toFixed(1)}% overall
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* ── summary stat cards ──────────────────────────────────────────── */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-300/40 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{periodALabel} Total</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{money(summary.totalCurr)}</p>
              </div>
              <div className="rounded-xl border border-slate-300/40 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{periodBLabel} Total</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{money(summary.totalPrev)}</p>
              </div>
              <div className="rounded-xl border border-slate-300/40 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Periods with Growth</p>
                <p className="text-lg font-bold text-emerald-400 tabular-nums">{summary.growthCount} <span className="text-xs text-slate-500 font-medium">of {summary.count}</span></p>
              </div>
              <div className="rounded-xl border border-slate-300/40 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Periods with Decline</p>
                <p className="text-lg font-bold text-rose-400 tabular-nums">{summary.declineCount} <span className="text-xs text-slate-500 font-medium">of {summary.count}</span></p>
              </div>
            </div>
          )}

          {/* ── bar chart ───────────────────────────────────────────────────── */}
          {activeData.chart.length > 0 ? (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeData.chart} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={yTickFmt}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip
                    content={
                      <ComparisonTooltip
                        periodALabel={periodALabel}
                        periodBLabel={periodBLabel}
                        accentA={accentA}
                        accentB={accentB}
                      />
                    }
                  />
                  <Legend
                    formatter={(value) => (value === "periodA" ? periodALabel : periodBLabel)}
                    wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="periodA"
                    name="periodA"
                    fill={accentA}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="periodB"
                    name="periodB"
                    fill={accentB}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    opacity={0.6}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">Not enough data for this comparison mode.</p>
            </div>
          )}

          {/* ── detail table ────────────────────────────────────────────────── */}
          {activeData.table.length > 0 && (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300/50 dark:border-slate-700/50">
                    <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {mode === "mom" ? "Month" : "Month"}
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {periodALabel}
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {periodBLabel}
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Difference
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30 dark:divide-slate-700/30">
                  {activeData.table.map((row, i) => {
                    const label = mode === "mom" ? fmtMonthFull(row.month) : row.monthLabel;
                    const maxAmt = Math.max(
                      ...activeData.table.map((r) => Math.max(r.current, r.previous))
                    );
                    const barWidthA = maxAmt > 0 ? (row.current / maxAmt) * 100 : 0;
                    const barWidthB = maxAmt > 0 ? (row.previous / maxAmt) * 100 : 0;
                    return (
                      <tr
                        key={i}
                        className="hover:bg-slate-200/20 dark:hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {label}
                          {mode === "mom" && (
                            <span className="text-xs text-slate-500 ml-1.5">vs {fmtMonthFull(row.prevMonth)}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                          {moneyDetailed(row.current)}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                          {moneyDetailed(row.previous)}
                        </td>
                        <td className={`px-3 py-3 text-right font-bold tabular-nums ${row.diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.diff >= 0 ? "+" : ""}{moneyDetailed(row.diff)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <ChangeBadge value={row.changePct} inverted={!isExpense} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-slate-200/40 dark:bg-slate-700/40 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${barWidthA}%`, backgroundColor: accentA }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-slate-200/40 dark:bg-slate-700/40 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 opacity-60"
                                  style={{ width: `${barWidthB}%`, backgroundColor: accentB }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* ── totals footer ── */}
                {summary && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-300/60 dark:border-slate-600/60 bg-slate-100/40 dark:bg-slate-800/40">
                      <td className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider">
                        Total
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        {moneyDetailed(summary.totalCurr)}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                        {moneyDetailed(summary.totalPrev)}
                      </td>
                      <td className={`px-3 py-3 text-right font-bold tabular-nums ${(summary.totalCurr - summary.totalPrev) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {(summary.totalCurr - summary.totalPrev) >= 0 ? "+" : ""}
                        {moneyDetailed(summary.totalCurr - summary.totalPrev)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <ChangeBadge value={summary.overallChange} inverted={!isExpense} />
                      </td>
                      <td className="px-3 py-3" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
