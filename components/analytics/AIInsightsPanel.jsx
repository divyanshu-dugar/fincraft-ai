"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  Upload,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { authFetch } from "@/lib/authenticate";

const ACCENT = {
  blue: {
    ring: "border-blue-400/40",
    badge: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    button: "bg-blue-500/15 hover:bg-blue-500/25 border-blue-400/40 text-blue-300",
    iconBg: "bg-blue-500/15 text-blue-300",
  },
  emerald: {
    ring: "border-emerald-400/40",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    button: "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-400/40 text-emerald-300",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
};

const SEVERITY_STYLE = {
  positive: { icon: CheckCircle2, cls: "text-emerald-300", chip: "bg-emerald-500/15 text-emerald-300" },
  warning:  { icon: AlertTriangle, cls: "text-rose-300", chip: "bg-rose-500/15 text-rose-300" },
  info:     { icon: Info, cls: "text-sky-300", chip: "bg-sky-500/15 text-sky-300" },
};

export default function AIInsightsPanel({
  open,
  onClose,
  kind, // "expense" | "income"
  range,
  summary,
  accent = "blue",
}) {
  const [state, setState] = useState({ status: "idle", data: null, error: "" });
  const accentCls = ACCENT[accent] || ACCENT.blue;
  const isExpense = kind === "expense";

  const runGeneration = async () => {
    if (!range || !summary) return;
    setState({ status: "loading", data: null, error: "" });
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai-analytics-insights`,
        {
          method: "POST",
          body: JSON.stringify({ kind, range, summary }),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", data: null, error: body?.error || `Request failed (${res.status})` });
        return;
      }
      if (body?.needsData) {
        setState({ status: "needs-data", data: body, error: "" });
        return;
      }
      setState({ status: "ready", data: body, error: "" });
    } catch (err) {
      setState({ status: "error", data: null, error: err?.message || "Request failed" });
    }
  };

  // Trigger a fresh fetch whenever the panel opens with a new range/summary.
  useEffect(() => {
    if (!open) return;
    runGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, range?.startMonth, range?.endMonth, summary?.totalAmount, summary?.entryCount]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[86vh] overflow-hidden flex flex-col rounded-t-3xl sm:rounded-3xl border ${accentCls.ring} bg-slate-900 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentCls.iconBg}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                AI {isExpense ? "Expense" : "Income"} Insights
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {range?.startMonth} → {range?.endMonth}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(state.status === "ready" || state.status === "error") && (
              <button
                onClick={runGeneration}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Regenerate"
                type="button"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          {state.status === "loading" && <LoadingState accent={accent} />}

          {state.status === "error" && (
            <ErrorState message={state.error} onRetry={runGeneration} />
          )}

          {state.status === "needs-data" && (
            <NeedsDataState kind={kind} reason={state.data?.reason} />
          )}

          {state.status === "ready" && state.data && (
            <Results data={state.data} accent={accent} />
          )}
        </div>

        {/* footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-700/60 bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Generated by AI — figures should be double-checked.</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState({ accent }) {
  const accentCls = ACCENT[accent] || ACCENT.blue;
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentCls.iconBg} mb-3`}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-white mb-1">Analyzing your data…</p>
      <p className="text-xs text-slate-500 max-w-xs">
        Crunching monthly totals, categories, and anomalies to surface patterns and recommendations.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/15 text-rose-300 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <p className="text-sm font-semibold text-white mb-1">Couldn&apos;t generate insights</p>
      <p className="text-xs text-slate-400 max-w-xs mb-4">{message}</p>
      <button
        onClick={onRetry}
        type="button"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-slate-200 transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Try again
      </button>
    </div>
  );
}

function NeedsDataState({ kind, reason }) {
  const isExpense = kind === "expense";
  const addHref = isExpense ? "/expense/add" : "/income/add";
  const listHref = isExpense ? "/expense/list" : "/income/list";
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/15 text-amber-300 mb-4">
        <Lightbulb className="w-6 h-6" />
      </div>
      <p className="text-base font-bold text-white mb-1">Not enough data yet</p>
      <p className="text-sm text-slate-400 max-w-md mb-5">
        {reason || `Log or import a few ${isExpense ? "expenses" : "income entries"} to unlock personalised AI insights.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
        <Link
          href={addHref}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-slate-200 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Log {isExpense ? "expense" : "income"}
        </Link>
        {isExpense && (
          <Link
            href={listHref}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-sm font-semibold text-blue-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
        )}
      </div>
      {isExpense && (
        <p className="text-[11px] text-slate-500 mt-3">
          Tip: the Import CSV button lives on the Expense List page.
        </p>
      )}
    </div>
  );
}

function Results({ data, accent }) {
  const accentCls = ACCENT[accent] || ACCENT.blue;
  return (
    <div className="space-y-6">
      {data.headline && (
        <div className={`rounded-2xl border ${accentCls.ring} ${accentCls.iconBg} p-4`}>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold leading-relaxed">{data.headline}</p>
          </div>
        </div>
      )}

      {data.insights?.length > 0 && (
        <section>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Insights</h4>
          <ul className="space-y-2.5">
            {data.insights.map((insight, i) => {
              const style = SEVERITY_STYLE[insight.severity] || SEVERITY_STYLE.info;
              const Icon = style.icon;
              return (
                <li
                  key={i}
                  className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.chip}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{insight.title}</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{insight.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.recommendations?.length > 0 && (
        <section>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Recommendations</h4>
          <ul className="space-y-2.5">
            {data.recommendations.map((rec, i) => (
              <li
                key={i}
                className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500/15 text-amber-300">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">{rec.title}</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.action}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!data.insights?.length && !data.recommendations?.length && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">The AI didn&apos;t produce any insights this time. Try regenerating.</p>
        </div>
      )}
    </div>
  );
}
