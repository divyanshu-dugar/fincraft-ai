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
import { X, Check, Loader2, RefreshCw, Wallet, ChevronRight } from 'lucide-react';
import { getToken } from '@/lib/authenticate';

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

// ── Inline category selector ─────────────────────────────────────────────────
// Renders directly in the flow (no dropdowns) so overflow-y-auto never clips it.

function InlineCategoryPicker({ tree = [], value, onChange, error }) {
  const [selectedParent, setSelectedParent] = useState(null);

  // Keep selectedParent in sync when value is cleared externally
  useEffect(() => {
    if (!value) setSelectedParent(null);
  }, [value]);

  function pickParent(parent) {
    setSelectedParent(parent);
    // If the parent has no subcategories, select it directly
    if (!parent.subcategories?.length) {
      onChange({ parentId: parent._id, parentName: parent.name, parentIcon: parent.icon, subcategoryId: null, subcategoryName: null });
    } else {
      // Clear subcategory selection when switching parent
      if (value?.parentId !== parent._id) {
        onChange(null);
      }
    }
  }

  function pickSub(sub) {
    onChange({
      parentId: selectedParent._id,
      parentName: selectedParent.name,
      parentIcon: selectedParent.icon,
      subcategoryId: sub._id,
      subcategoryName: sub.name,
      subcategoryIcon: sub.icon,
    });
  }

  const activeSubs = selectedParent?.subcategories || [];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Category <span className="text-red-400">*</span>
      </label>

      {/* Parent chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tree.map((parent) => {
          const isActive = selectedParent?._id === parent._id;
          return (
            <button
              key={parent._id}
              type="button"
              onClick={() => pickParent(parent)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-500/25 border-indigo-400/70 text-indigo-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              <span>{parent.icon || '📁'}</span>
              {parent.name}
              {parent.subcategories?.length > 0 && (
                <ChevronRight size={11} className={`transition-transform duration-150 ${isActive ? 'rotate-90' : ''}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Subcategory chips — shown inline below selected parent */}
      <AnimatePresence>
        {selectedParent && activeSubs.length > 0 && (
          <motion.div
            key={selectedParent._id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pl-2 border-l-2 border-indigo-500/40 mt-1 mb-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                {selectedParent.name} › sub-category
              </p>
              <div className="flex flex-wrap gap-2">
                {activeSubs.map((sub) => {
                  const isSelected = value?.subcategoryId === sub._id;
                  return (
                    <button
                      key={sub._id}
                      type="button"
                      onClick={() => pickSub(sub)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-400 text-white'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-indigo-400/50 hover:text-slate-200'
                      }`}
                    >
                      <span>{sub.icon || '💰'}</span>
                      {sub.name}
                      {isSelected && <Check size={11} className="text-indigo-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected value summary */}
      {value && (
        <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
          <Check size={13} className="text-indigo-400 shrink-0" />
          <span className="text-xs text-indigo-200 font-medium">
            {value.parentName}{value.subcategoryName ? ` › ${value.subcategoryName}` : ''}
          </span>
          <button
            type="button"
            onClick={() => { onChange(null); setSelectedParent(null); }}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}


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
  const [isRecurring,   setIsRecurring]   = useState(false);
  const [repeatUntil,   setRepeatUntil]   = useState('');
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
    setIsRecurring(false);
    setRepeatUntil('');
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
        isRecurring,
        repeatUntil:    isRecurring && repeatUntil ? `${repeatUntil}T23:59:59.999Z` : null,
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

                {/* Category — inline two-step selector */}
                <InlineCategoryPicker
                  tree={categoryTree}
                  value={categoryValue}
                  onChange={(val) => { setCategoryValue(val); clearErr('category'); }}
                  error={errors.category}
                />

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

                {/* Recurring toggle */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 divide-y divide-slate-700/60">
                  <div className="px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isRecurring ? 'bg-indigo-500/20' : 'bg-slate-700'}`}>
                        <RefreshCw size={14} className={isRecurring ? 'text-indigo-400' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Repeat Budget</p>
                        <p className="text-xs text-slate-400">Auto-renew each {period} period</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRecurring((p) => !p)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isRecurring ? 'bg-indigo-600' : 'bg-slate-600'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {isRecurring && (
                    <div className="px-4 py-3.5">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Repeat Until <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <input
                        type="date"
                        value={repeatUntil}
                        onChange={(e) => setRepeatUntil(e.target.value)}
                        min={dateRange.endDate || undefined}
                        className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 [color-scheme:dark]"
                      />
                      <p className="text-xs text-indigo-400 mt-1.5">
                        Leaves blank to repeat forever.
                      </p>
                    </div>
                  )}
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
