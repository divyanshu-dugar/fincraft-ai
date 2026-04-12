'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  CalendarDays,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import { getToken } from '@/lib/authenticate';
import { CategoryPicker } from '@/components/categories/CategoryPicker';

const API = process.env.NEXT_PUBLIC_API_URL;

const PERIOD_OPTIONS = [
  { value: 'weekly',  label: 'Weekly',  sub: 'Mon → Sun' },
  { value: 'monthly', label: 'Monthly', sub: '1st → Last day' },
  { value: 'yearly',  label: 'Yearly',  sub: 'Jan 1 → Dec 31' },
];

const QUICK_AMOUNTS = {
  weekly:  [50, 100, 200, 500],
  monthly: [500, 1000, 2000, 5000],
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

export default function AddBudget() {
  const router = useRouter();

  const [categoryTree,  setCategoryTree]  = useState([]);
  const [categoryValue, setCategoryValue] = useState(null);
  const [amount,        setAmount]        = useState('');
  const [period,        setPeriod]        = useState('monthly');
  const [refDate,       setRefDate]       = useState(todayLocal);
  const [dateRange,     setDateRange]     = useState(() => calcDateRange(todayLocal(), 'monthly'));
  const [name,          setName]          = useState('');
  const [notifications, setNotifications] = useState(true);
  const [threshold,     setThreshold]     = useState(80);
  const [isRecurring,   setIsRecurring]   = useState(false);
  const [repeatUntil,   setRepeatUntil]   = useState('');
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);

  // Recalc date range when period or refDate changes
  useEffect(() => {
    setDateRange(calcDateRange(refDate, period));
  }, [refDate, period]);

  // ── category tree ─────────────────────────────────────────────────────────
  const fetchCategoryTree = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/expense-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.tree) setCategoryTree(data.tree);
    } catch { /* silent */ }
  }, []);

  const seedIfEmpty = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API}/expense-categories/seed`, {
        method: 'POST',
        headers: { Authorization: `jwt ${token}` },
      });
      fetchCategoryTree();
    } catch { /* silent */ }
  }, [fetchCategoryTree]);

  useEffect(() => { fetchCategoryTree(); }, [fetchCategoryTree]);
  useEffect(() => { if (categoryTree.length === 0) seedIfEmpty(); }, [categoryTree.length]);

  const handleAddCategory = async (parentId, catName, color) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const body = parentId ? { name: catName, parentCategory: parentId } : { name: catName, isParent: true };
    if (color) body.color = color;
    const res = await fetch(`${API}/expense-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to create category');
    }
    fetchCategoryTree();
  };

  // ── validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!name.trim())                    e.name     = 'Budget name is required';
    if (!amount || Number(amount) <= 0)  e.amount   = 'Enter a valid amount';
    if (!categoryValue)                  e.category = 'Please select a category';
    if (!refDate)                        e.refDate  = 'Select a reference date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearErr = (field) => setErrors((p) => ({ ...p, [field]: '' }));

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = getToken();
      const catId = categoryValue.subcategoryId || categoryValue.parentId;
      const payload = {
        name: name.trim(),
        amount: Number(amount),
        period,
        category: catId,
        startDate: new Date(dateRange.startDate + 'T00:00:00Z').toISOString(),
        endDate:   new Date(dateRange.endDate   + 'T23:59:59.999Z').toISOString(),
        notifications,
        alertThreshold: threshold,
        isRecurring,
        repeatUntil: isRecurring && repeatUntil ? new Date(repeatUntil + 'T23:59:59.999Z').toISOString() : null,
      };
      const res = await fetch(`${API}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to create budget');
      }
      toast.success('Budget created!');
      setSuccess(true);
      setTimeout(() => router.push('/budget/list'), 900);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAmountSet = amount && Number(amount) > 0;
  const quickAmounts = QUICK_AMOUNTS[period] || QUICK_AMOUNTS.monthly;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-18">

      {/* sticky header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Create Budget</h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Set a spending limit</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── amount hero card ──────────────────────────────────────────── */}
          <div className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-sm p-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Budget Amount <span className="text-rose-400">*</span>
            </label>

            <div className={`flex items-center gap-3 mb-5 pb-5 border-b border-slate-700 transition-all duration-200 ${isAmountSet ? 'opacity-100' : 'opacity-70'}`}>
              <span className="text-4xl font-black text-slate-600 select-none">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); clearErr('amount'); }}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                min="0.01"
                step="0.01"
                className={`flex-1 text-5xl font-black tracking-tight bg-transparent outline-none placeholder:text-slate-700 ${errors.amount ? 'text-rose-400' : 'text-white'}`}
                style={{ minWidth: 0 }}
              />
              {isAmountSet && (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-indigo-400" />
                </div>
              )}
            </div>

            {errors.amount && <p className="text-xs text-rose-400 font-semibold -mt-3 mb-4">{errors.amount}</p>}

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick amounts</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setAmount(v.toString()); clearErr('amount'); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-150 ${
                      Number(amount) === v
                        ? 'bg-slate-200 text-slate-900 border-slate-200 shadow-md'
                        : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    ${v.toLocaleString('en-US')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── details card ──────────────────────────────────────────────── */}
          <div className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-sm divide-y divide-slate-700">

            {/* budget name */}
            <div className="px-6 py-5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Budget Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); clearErr('name'); }}
                placeholder="e.g. Groceries, Entertainment, Travel…"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${errors.name ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 placeholder-rose-400/50' : 'border-slate-600 bg-slate-700/50 text-slate-200 placeholder-slate-500 hover:bg-slate-700 focus:bg-slate-700'}`}
              />
              {errors.name && <p className="text-xs text-rose-400 font-semibold mt-1.5">{errors.name}</p>}
            </div>

            {/* category */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Category <span className="text-rose-400">*</span>
              </label>
              <CategoryPicker
                tree={categoryTree}
                value={categoryValue}
                onChange={(val) => { setCategoryValue(val); clearErr('category'); }}
                onAddCategory={handleAddCategory}
                placeholder="Select an expense category"
                error={errors.category}
              />
              {errors.category && <p className="text-xs text-rose-400 font-semibold mt-1.5">{errors.category}</p>}
            </div>

            {/* period selector */}
            <div className="px-6 py-5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Budget Period
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPeriod(opt.value)}
                    className={`px-3 py-3 rounded-xl border text-left transition-all ${
                      period === opt.value
                        ? 'border-indigo-400 bg-indigo-500/15 shadow-sm'
                        : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                    }`}
                  >
                    <p className={`text-sm font-bold leading-none ${period === opt.value ? 'text-indigo-300' : 'text-slate-300'}`}>
                      {opt.label}
                    </p>
                    <p className={`text-xs mt-1 ${period === opt.value ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {opt.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* reference date + auto-calculated range */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                <CalendarDays className="w-3.5 h-3.5" />
                Reference Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={refDate}
                onChange={(e) => { setRefDate(e.target.value); clearErr('refDate'); }}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all [color-scheme:dark] ${errors.refDate ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-700 focus:bg-slate-700'}`}
              />
              {errors.refDate && <p className="text-xs text-rose-400 font-semibold mt-1.5">{errors.refDate}</p>}

              {/* calculated range display */}
              {dateRange.startDate && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-indigo-500/15 rounded-xl px-4 py-3 border border-indigo-500/20">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-0.5">Start</p>
                    <p className="text-sm font-bold text-indigo-300">{fmtDisplay(dateRange.startDate)}</p>
                  </div>
                  <div className="bg-indigo-500/15 rounded-xl px-4 py-3 border border-indigo-500/20">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-0.5">End</p>
                    <p className="text-sm font-bold text-indigo-300">{fmtDisplay(dateRange.endDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── alert settings card ───────────────────────────────────────── */}
          <div className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-sm divide-y divide-slate-700">

            {/* notifications toggle */}
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${notifications ? 'bg-indigo-500/20' : 'bg-slate-700'}`}>
                  {notifications ? <Bell className="w-4 h-4 text-indigo-400" /> : <BellOff className="w-4 h-4 text-slate-400" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Alert Notifications</p>
                  <p className="text-xs text-slate-400">Get notified when you approach the limit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifications((p) => !p)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-indigo-600' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* threshold slider */}
            {notifications && (
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Alert Threshold
                  </label>
                  <span className="text-lg font-black text-indigo-400">{threshold}%</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10%</span>
                  <span className="text-slate-300 font-medium">Alert at {threshold}% usage</span>
                  <span>100%</span>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  {[50, 70, 80, 90].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setThreshold(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        threshold === v
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── recurring card ───────────────────────────────────────────── */}
          <div className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-sm divide-y divide-slate-700">

            {/* recurring toggle */}
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isRecurring ? 'bg-indigo-500/20' : 'bg-slate-700'}`}>
                  <RefreshCw className={`w-4 h-4 ${isRecurring ? 'text-indigo-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Repeat Budget</p>
                  <p className="text-xs text-slate-400">Auto-renew each {period} period</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecurring((p) => !p)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRecurring ? 'bg-indigo-600' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* repeat until date */}
            {isRecurring && (
              <div className="px-6 py-5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Repeat Until <span className="text-slate-500 font-normal normal-case tracking-normal">(optional — leave blank to repeat forever)</span>
                </label>
                <input
                  type="date"
                  value={repeatUntil}
                  onChange={(e) => setRepeatUntil(e.target.value)}
                  min={dateRange.endDate || undefined}
                  className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-slate-200 text-sm font-medium outline-none hover:bg-slate-700 focus:bg-slate-700 [color-scheme:dark]"
                />
                <p className="text-xs text-indigo-400 font-medium mt-2">
                  This budget will auto-renew every {period} until {repeatUntil ? fmtDisplay(repeatUntil) : 'you stop it'}.
                </p>
              </div>
            )}
          </div>

          {/* ── submit ────────────────────────────────────────────────────── */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3.5 rounded-2xl border border-slate-600 text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : success ? (
                <><Check className="w-4 h-4" /> Created!</>
              ) : (
                <><Wallet className="w-4 h-4" /> Create Budget</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
