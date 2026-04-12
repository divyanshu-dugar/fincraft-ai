"use client";

import toast from "react-hot-toast";
import { GoalDetailSkeleton } from "@/components/skeletons/PageSkeletons";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  PiggyBank,
  TrendingUp,
  Calendar,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0);

const formatDate = (d) => {
  if (!d) return "—";
  const s = String(d).split("T")[0];
  const [y, m, day] = s.split("-").map(Number);
  if (!y || !m || !day) return "—";
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const formatRelative = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

const getPriorityConfig = (p) => {
  if (p === "high") return { label: "High", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", dot: "bg-red-500" };
  if (p === "medium") return { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", dot: "bg-yellow-500" };
  return { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-500" };
};

/** Circular SVG progress ring */
function ProgressRing({ percent, size = 160, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.min(percent / 100, 1) * circ;
  const color = percent >= 100 ? "#10b981" : percent >= 60 ? "#6366f1" : percent >= 30 ? "#f59e0b" : "#ec4899";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

/** Compute projected completion date based on last 90-days avg monthly contribution rate */
function computeProjection(goal) {
  if (!goal || !goal.contributions?.length) return null;

  const remaining = Math.max((goal.amount ?? 0) - (goal.savedAmount ?? 0), 0);
  if (remaining <= 0) return { completedAlready: true };

  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 86400000;
  const recentContribs = goal.contributions.filter((c) => new Date(c.date).getTime() >= ninetyDaysAgo);

  const windowDays =
    recentContribs.length >= 2
      ? Math.max((now - Math.min(...recentContribs.map((c) => new Date(c.date).getTime()))) / 86400000, 1)
      : 30;

  const recentTotal = recentContribs.reduce((s, c) => s + c.amount, 0);
  const dailyRate = recentTotal / windowDays;
  const monthlyRate = dailyRate * 30.44;

  if (monthlyRate <= 0) return null;

  const monthsNeeded = remaining / monthlyRate;
  const completionDate = new Date(now + monthsNeeded * 30.44 * 86400000);

  let status = "on-track";
  if (goal.deadline) {
    const deadlineDate = new Date(String(goal.deadline).split("T")[0]);
    if (completionDate > deadlineDate) status = "behind";
    else if (completionDate < new Date(deadlineDate.getTime() - 30 * 86400000)) status = "ahead";
  }

  return { completionDate, monthlyRate, status };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function GoalDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contribution form
  const [showContribForm, setShowContribForm] = useState(false);
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Show full history toggle
  const [showAllHistory, setShowAllHistory] = useState(false);

  const fetchGoal = useCallback(async () => {
    const token = getToken();
    try {
      const res = await fetch(`${API}/saving-goals/${id}`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load goal");
      const data = await res.json();
      setGoal(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const handleContribute = async (e) => {
    e.preventDefault();
    const amount = parseFloat(contribAmount);
    if (!amount || amount <= 0) return;
    setSubmitting(true);
    const token = getToken();
    try {
      const res = await fetch(`${API}/saving-goals/${id}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify({ amount, note: contribNote }),
      });
      if (!res.ok) throw new Error("Failed to log contribution");
      const updated = await res.json();
      setGoal(updated);
      setContribAmount("");
      setContribNote("");
      setShowContribForm(false);
      toast.success('Contribution logged!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContribution = async (contributionId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API}/saving-goals/${id}/contribute/${contributionId}`, {
        method: "DELETE",
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete contribution");
      const updated = await res.json();
      setGoal(updated);
      setDeleteConfirmId(null);
      toast.success('Contribution removed.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────

  if (loading) {
    return <GoalDetailSkeleton />;
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-medium">{error || "Goal not found"}</p>
          <Link href="/goal/list" className="text-purple-400 underline text-sm">Back to goals</Link>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const saved = goal.savedAmount ?? 0;
  const target = goal.amount ?? 0;
  const percent = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const remaining = Math.max(target - saved, 0);
  const isComplete = saved >= target;
  const daysLeft = (() => {
    if (!goal.deadline) return null;
    const s = String(goal.deadline).split("T")[0];
    const [y, m, d] = s.split("-").map(Number);
    const deadlineUtc = new Date(Date.UTC(y, m - 1, d));
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    return Math.ceil((deadlineUtc - todayUtc) / 86400000);
  })();

  const priorityCfg = getPriorityConfig(goal.priority);
  const projection = computeProjection(goal);

  // Contributions sorted newest first
  const sortedContribs = [...(goal.contributions ?? [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const displayedContribs = showAllHistory ? sortedContribs : sortedContribs.slice(0, 5);

  // Monthly avg from all time
  const allTimeMonthly = (() => {
    if (!goal.contributions?.length) return 0;
    const total = goal.contributions.reduce((s, c) => s + c.amount, 0);
    const oldest = Math.min(...goal.contributions.map((c) => new Date(c.date).getTime()));
    const months = Math.max((Date.now() - oldest) / (30.44 * 86400000), 1);
    return total / months;
  })();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-18 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link
            href="/goal/list"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Goals
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{goal.name}</h1>
              {goal.description && (
                <p className="text-slate-400 mt-1 max-w-xl">{goal.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
                <span className={`w-2 h-2 rounded-full ${priorityCfg.dot}`} />
                {priorityCfg.label} Priority
              </span>
              <Link
                href="/goal/list"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 shadow-sm transition-colors"
              >
                <Edit3 size={14} /> Edit Goal
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Hero Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-800/60 rounded-3xl shadow-xl border border-cyan-400/20 p-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing percent={percent} size={160} stroke={14} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{Math.round(percent)}%</span>
              <span className="text-xs text-slate-500 font-medium">complete</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="bg-emerald-500/15 rounded-2xl p-4 border border-emerald-500/30">
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Saved</p>
                <p className="text-2xl font-extrabold text-emerald-300 mt-1">{formatCurrency(saved)}</p>
                <p className="text-xs text-emerald-500 mt-0.5">of {formatCurrency(target)}</p>
              </div>

              <div className="bg-purple-500/15 rounded-2xl p-4 border border-purple-500/30">
                <p className="text-xs font-medium text-purple-400 uppercase tracking-wide">Remaining</p>
                <p className="text-2xl font-extrabold text-purple-300 mt-1">{formatCurrency(remaining)}</p>
                <p className="text-xs text-purple-500 mt-0.5">to go</p>
              </div>

              <div className="bg-blue-500/15 rounded-2xl p-4 border border-blue-500/30">
                <p className="text-xs font-medium text-blue-400 uppercase tracking-wide">Deadline</p>
                <p className="text-lg font-bold text-blue-300 mt-1">{formatDate(goal.deadline)}</p>
                <p className="text-xs text-blue-500 mt-0.5">
                  {daysLeft === null ? "No deadline" : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                </p>
              </div>

              <div className="bg-orange-500/15 rounded-2xl p-4 border border-orange-500/30">
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wide">Avg/Month</p>
                <p className="text-lg font-bold text-orange-300 mt-1">{formatCurrency(allTimeMonthly)}</p>
                <p className="text-xs text-orange-500 mt-0.5">{goal.contributions?.length ?? 0} contributions</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isComplete
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : percent >= 60
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                    : percent >= 30
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                    : "bg-gradient-to-r from-pink-400 to-rose-500"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Projection Card */}
        {(projection || isComplete) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100/60 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <TrendingUp size={18} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Projected Completion</h2>
            </div>

            {isComplete ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 size={22} className="text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-700">Goal Achieved!</p>
                  <p className="text-sm text-emerald-600">You have reached your savings target.</p>
                </div>
              </div>
            ) : projection ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 flex-1 min-w-[200px]">
                    <Calendar size={18} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Estimated Completion</p>
                      <p className="font-bold text-gray-900">
                        {projection.completionDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-4 rounded-xl border flex-1 min-w-[200px] ${
                    projection.status === "ahead"
                      ? "bg-emerald-50 border-emerald-200"
                      : projection.status === "behind"
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }`}>
                    {projection.status === "ahead" ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : projection.status === "behind" ? (
                      <AlertTriangle size={18} className="text-red-500" />
                    ) : (
                      <Clock size={18} className="text-blue-600" />
                    )}
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${
                        projection.status === "ahead" ? "text-emerald-600" : projection.status === "behind" ? "text-red-500" : "text-blue-600"
                      }`}>Status</p>
                      <p className={`font-bold ${
                        projection.status === "ahead" ? "text-emerald-700" : projection.status === "behind" ? "text-red-600" : "text-blue-700"
                      }`}>
                        {projection.status === "ahead" ? "Ahead of Schedule" : projection.status === "behind" ? "Behind Schedule" : "On Track"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  Based on your recent contribution rate of{" "}
                  <span className="font-semibold text-gray-700">{formatCurrency(projection.monthlyRate)}/month</span>{" "}
                  (last 90 days).
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Log your first contribution to see a projected completion date.</p>
            )}
          </motion.div>
        )}

        {/* Log Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-slate-800/60 rounded-2xl shadow-md border border-cyan-400/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <PiggyBank size={18} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Log Contribution</h2>
            </div>
            {!isComplete && !showContribForm && (
              <button
                onClick={() => setShowContribForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold shadow hover:shadow-md transition-all"
              >
                <Plus size={16} /> Add Contribution
              </button>
            )}
          </div>

          <AnimatePresence>
            {showContribForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleContribute}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Amount *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={contribAmount}
                        onChange={(e) => setContribAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-slate-600 bg-slate-700/50 text-slate-200 placeholder-slate-400 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Note (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. November savings"
                      value={contribNote}
                      onChange={(e) => setContribNote(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-600 bg-slate-700/50 text-slate-200 placeholder-slate-400 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Quick amounts */}
                {target > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Quick amounts:</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { label: "Daily", value: remaining > 0 && daysLeft > 0 ? remaining / daysLeft : null },
                        { label: "Monthly", value: remaining > 0 && daysLeft > 0 ? (remaining / daysLeft) * 30.44 : null },
                        { label: "10%", value: target * 0.1 },
                        { label: "25%", value: target * 0.25 },
                      ]
                        .filter((q) => q.value && q.value > 0)
                        .map((q) => (
                          <button
                            key={q.label}
                            type="button"
                            onClick={() => setContribAmount(q.value.toFixed(2))}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/50 text-slate-300 hover:bg-emerald-500/15 hover:text-emerald-400 transition-colors border border-slate-600"
                          >
                            {q.label}: {formatCurrency(q.value)}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !contribAmount || parseFloat(contribAmount) <= 0}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving…" : "Save Contribution"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowContribForm(false); setContribAmount(""); setContribNote(""); }}
                    className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-400 font-medium text-sm hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {isComplete && !showContribForm && (
            <p className="text-sm text-emerald-600 font-medium">🎉 This goal is fully funded!</p>
          )}
        </motion.div>

        {/* Contribution History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-800/60 rounded-2xl shadow-md border border-cyan-400/20 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Target size={18} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Contribution History</h2>
                <p className="text-xs text-slate-500">{goal.contributions?.length ?? 0} total entries</p>
              </div>
            </div>
          </div>

          {!sortedContribs.length ? (
            <div className="text-center py-10 text-slate-500">
              <PiggyBank size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No contributions yet</p>
              <p className="text-sm mt-1">Log your first contribution to start tracking progress.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Running total header */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 border-b border-slate-700">
                <span>Contribution</span>
                <span>Amount</span>
              </div>

              <AnimatePresence>
                {displayedContribs.map((c, idx) => {
                  // Running total (from oldest → this entry, newest-first display reversed)
                  const runningTotal = sortedContribs
                    .slice(idx)
                    .reduce((s, x) => s + x.amount, 0);

                  return (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="group flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-slate-700/40 transition-colors"
                    >
                      {/* Timeline dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-800 ring-offset-1 ring-offset-slate-800" />
                        {idx < displayedContribs.length - 1 && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-700" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-slate-200">{formatCurrency(c.amount)}</span>
                            {c.note && (
                              <span className="text-sm text-slate-400 truncate">{c.note}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{formatRelative(c.date)} · {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                        </div>

                        {/* Running total */}
                        <div className="hidden sm:block text-xs text-slate-500 text-right min-w-[80px]">
                          <p className="font-medium text-slate-300">{formatCurrency(runningTotal)}</p>
                          <p>total at this point</p>
                        </div>

                      {/* Delete */}
                      {deleteConfirmId === c._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteContribution(c._id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(c._id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {sortedContribs.length > 5 && (
                <button
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-slate-200 font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  {showAllHistory ? (
                    <><ChevronUp size={16} /> Show less</>
                  ) : (
                    <><ChevronDown size={16} /> Show all {sortedContribs.length} contributions</>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
