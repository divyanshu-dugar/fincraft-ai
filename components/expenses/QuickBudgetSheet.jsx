'use client';

/**
 * @file QuickBudgetSheet.jsx
 * @description
 * A bottom-drawer sheet for creating a budget quickly without navigating
 * away from the expense list. Pre-fills the amount from the current month's
 * total spending and inherits the visible date range.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Wallet } from 'lucide-react';
import { getToken } from '@/lib/authenticate';
import { CategoryPicker } from '@/components/categories/CategoryPicker';

const API   = process.env.NEXT_PUBLIC_API_URL;
const SCHEME = 'jwt';

const PERIOD_OPTIONS = [
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly' },
];

const QUICK_AMOUNTS = {
  weekly:  [50,   100,   200,   500],
  monthly: [500,  1000,  2000,  5000],
  yearly:  [5000, 10000, 25000, 50000],
};

// ── date helpers ─────────────────────────────────────────────────────────────

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function utcDateStr(date) {
  return date.toISOString().split('T')[0];
}

function calcDateRange(refDate, period) {
  if (!refDate) return { startDate: '', endDate: '' };
  const local = new Date(refDate + 'T00:00:00');
  let start, end;

  if (period === 'weekly') {
    const day = local.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(local); mon.setDate(local.getDate() + diff);
    const sun = new Date(mon);   sun.setDate(mon.getDate() + 6);
    start = new Date(Date.UTC(mon.getFullYear(), mon.getMonth(), mon.getDate()));
    end   = new Date(Date.UTC(sun.getFullYear(), sun.getMonth(), sun.getDate()));
  } else if (period === 'monthly') {
    start = new Date(Date.UTC(local.getFullYear(), local.getMonth(), 1));
    end   = new Date(Date.UTC(local.getFullYear(), local.getMonth() + 1, 0));
  } else {
    start = new Date(Date.UTC(local.getFullYear(), 0, 1));
    end   = new Date(Date.UTC(local.getFullYear(), 11, 31));
  }
  return { startDate: utcDateStr(start), endDate: utcDateStr(end) };
}

function fmtDisplay(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {boolean}   props.open              - Whether the sheet is visible
 * @param {function}  props.onClose           - Callback to close the sheet
 * @param {Array}     props.categoryTree      - Expense category tree for the picker
 * @param {function}  props.onAddCategory     - Handler to create a new category
 * @param {number}    [props.prefillAmount]   - Total spend to pre-fill the amount field
 * @param {string}    [props.prefillStartDate] - ISO date string (YYYY-MM-DD)
 * @param {string}    [props.prefillEndDate]   - ISO date string (YYYY-MM-DD)
 */
export default function QuickBudgetSheet({
  open,
  onClose,
  categoryTree = [],
  onAddCategory,
  prefillAmount = 0,
  prefillStartDate,
  prefillEndDate,
}) {
  const [categoryValue, setCategoryValue] = useState(null);
  const [amount,        setAmount]        = useState('');
  const [period,        setPeriod]        = useState('monthly');
  const [name,          setName]          = useState('');
  const [dateRange,     setDateRange]     = useState({ startDate: '', endDate: '' });
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);

  // Reset form whenever the sheet opens
  useEffect(() => {
    if (!open) return;
    setCategoryValue(null);
    setAmount(prefillAmount > 0 ? String(Math.ceil(prefillAmount)) : '');
    setPeriod('monthly');
    setName('');
    setErrors({});
    setLoading(false);
    setSuccess(false);

    // Use the passed date range if available, otherwise auto-calc from today
    if (prefillStartDate && prefillEndDate) {
      setDateRange({ startDate: prefillStartDate, endDate: prefillEndDate });
    } else {
      setDateRange(calcDateRange(todayLocal(), 'monthly'));
    }
  }, [open, prefillAmount, prefillStartDate, prefillEndDate]);

  // Recalc date range when period changes (but let prefill win on first open)
  const handlePeriodChange = useCallback((p) => {
    setPeriod(p);
    setDateRange(calcDateRange(todayLocal(), p));
  }, []);

  const clearErr = (f) => setErrors((prev) => ({ ...prev, [f]: '' }));

  const validate = () => {
    const e = {};
    if (!name.trim())               e.name     = 'Budget name is required';
    if (!amount || Number(amount) <= 0) e.amount = 'Enter a valid amount';
    if (!categoryValue)             e.category = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const token = getToken();
      const catId = categoryValue?.subcategoryId || categoryValue?.parentId;

      const payload = {
        name:           name.trim(),
        amount:         Number(amount),
        period,
        category:       catId,
        startDate:      `${dateRange.startDate}T00:00:00Z`,
        endDate:        `${dateRange.endDate}T23:59:59.999Z`,
        notifications:  true,
        alertThreshold: 80,
      };

      const res = await fetch(`${API}/budgets`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `${SCHEME} ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to create budget');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700/60 rounded-t-3xl shadow-2xl px-5 pt-5 pb-8 max-h-[90dvh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Wallet size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">Set a Budget</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fmtDisplay(dateRange.startDate)} – {fmtDisplay(dateRange.endDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check size={32} className="text-emerald-400" strokeWidth={3} />
                </div>
                <p className="text-white font-semibold text-lg">Budget created!</p>
              </div>
            ) : (
              <div className="space-y-5">

                {/* Budget name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Budget Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearErr('name'); }}
                    placeholder="e.g. Monthly Groceries"
                    className={`w-full bg-slate-800/80 border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all ${
                      errors.name ? 'border-red-500/60' : 'border-slate-700/60'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Period</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handlePeriodChange(opt.value)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                          period === opt.value
                            ? 'bg-indigo-500/20 border-indigo-400/60 text-indigo-300'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className={`rounded-xl border overflow-hidden ${errors.category ? 'border-red-500/60' : 'border-slate-700/60'}`}>
                    <CategoryPicker
                      tree={categoryTree}
                      value={categoryValue}
                      onChange={(val) => { setCategoryValue(val); clearErr('category'); }}
                      onAddCategory={onAddCategory}
                    />
                  </div>
                  {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Budget Limit (USD) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); clearErr('amount'); }}
                      placeholder="0"
                      className={`w-full bg-slate-800/80 border rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all ${
                        errors.amount ? 'border-red-500/60' : 'border-slate-700/60'
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}

                  {/* Quick amount chips */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(QUICK_AMOUNTS[period] || []).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => { setAmount(String(q)); clearErr('amount'); }}
                        className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:border-indigo-400/60 hover:text-indigo-300 transition-colors"
                      >
                        ${q.toLocaleString()}
                      </button>
                    ))}
                    {prefillAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => { setAmount(String(Math.ceil(prefillAmount))); clearErr('amount'); }}
                        className="px-3 py-1 rounded-lg bg-indigo-800/40 border border-indigo-600/40 text-indigo-300 text-xs hover:border-indigo-400 transition-colors"
                      >
                        ≈ Current spend ${Math.ceil(prefillAmount).toLocaleString()}
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    {errors.submit}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:border-slate-500 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                    {loading ? 'Saving…' : 'Create Budget'}
                  </button>
                </div>

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
