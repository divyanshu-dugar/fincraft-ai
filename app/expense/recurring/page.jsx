'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  IndianRupee,
  Pause,
  Play,
  Plus,
  Repeat,
  Trash2,
} from 'lucide-react';
import { getToken } from '@/lib/authenticate';

const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const FREQUENCY_COLORS = {
  daily:   'from-rose-500 to-orange-500',
  weekly:  'from-amber-500 to-yellow-500',
  monthly: 'from-violet-500 to-purple-600',
  yearly:  'from-blue-500 to-indigo-600',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function RecurringExpensesPage() {
  const router = useRouter();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchRules = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-expenses`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) return;
      setRules(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const toggleActive = async (rule) => {
    setTogglingId(rule._id);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-expenses/${rule._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setRules((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    } catch { /* silent */ } finally {
      setTogglingId(null);
    }
  };

  const deleteRule = async (id) => {
    if (!window.confirm('Delete this recurring expense? Future entries will not be created, but past entries remain.')) return;
    setDeletingId(id);
    try {
      const token = getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `jwt ${token}` },
      });
      setRules((prev) => prev.filter((r) => r._id !== id));
    } catch { /* silent */ } finally {
      setDeletingId(null);
    }
  };

  const active   = rules.filter((r) => r.isActive);
  const inactive = rules.filter((r) => !r.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-18">
      {/* sticky header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => router.push('/expense/list')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Repeat className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Recurring Expenses</h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Auto-generated on schedule</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => router.push('/expense/add')}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {loading ? (
          <div className="flex justify-center py-20 text-slate-500 text-sm">Loading…</div>
        ) : rules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-violet-500/15 rounded-2xl flex items-center justify-center">
              <Repeat className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No recurring expenses</h3>
            <p className="text-slate-400 mb-6">Toggle "Recurring" when adding an expense to set one up.</p>
            <button
              onClick={() => router.push('/expense/add')}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-colors"
            >
              Add First Recurring Expense
            </button>
          </motion.div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Active ({active.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {active.map((rule) => (
                      <RuleCard
                        key={rule._id}
                        rule={rule}
                        onToggle={toggleActive}
                        onDelete={deleteRule}
                        deletingId={deletingId}
                        togglingId={togglingId}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {inactive.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Paused ({inactive.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {inactive.map((rule) => (
                      <RuleCard
                        key={rule._id}
                        rule={rule}
                        onToggle={toggleActive}
                        onDelete={deleteRule}
                        deletingId={deletingId}
                        togglingId={togglingId}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RuleCard({ rule, onToggle, onDelete, deletingId, togglingId }) {
  const cat = rule.category || {};
  const catName = cat.name || 'Uncategorised';
  const catColor = cat.color || '#9ca3af';
  const freqGradient = FREQUENCY_COLORS[rule.frequency] || 'from-slate-500 to-slate-600';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: rule.isActive ? 1 : 0.6 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 flex items-center gap-4"
    >
      {/* frequency badge */}
      <div className={`shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${freqGradient} flex flex-col items-center justify-center shadow-lg`}>
        <Repeat className="w-4 h-4 text-white mb-0.5" />
        <span className="text-xs font-bold text-white">{FREQUENCY_LABELS[rule.frequency]}</span>
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: catColor }}
          />
          <span className="text-sm font-bold text-white truncate">{catName}</span>
        </div>
        {rule.note && (
          <p className="text-xs text-slate-400 truncate mb-1">{rule.note}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            Next: {formatDate(rule.nextDueDate)}
          </span>
          {rule.endDate && (
            <span className="flex items-center gap-1">
              Until: {formatDate(rule.endDate)}
            </span>
          )}
        </div>
      </div>

      {/* amount */}
      <div className="shrink-0 text-right">
        <p className="text-lg font-black text-white flex items-center gap-0.5">
          <IndianRupee className="w-4 h-4 text-slate-400" />
          {rule.amount.toLocaleString('en-US')}
        </p>
      </div>

      {/* actions */}
      <div className="shrink-0 flex items-center gap-2">
        <button
          onClick={() => onToggle(rule)}
          disabled={togglingId === rule._id}
          title={rule.isActive ? 'Pause' : 'Resume'}
          className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-40"
        >
          {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onDelete(rule._id)}
          disabled={deletingId === rule._id}
          title="Delete"
          className="p-2 rounded-lg bg-slate-700/50 border border-rose-500/30 hover:bg-rose-500/15 text-rose-400 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
