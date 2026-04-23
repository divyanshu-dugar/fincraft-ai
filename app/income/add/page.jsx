'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authenticate';
import { IncomeCategoryPicker } from '@/components/categories/IncomeCategoryPicker';
import { useCurrencyPrefs } from '@/lib/hooks/useCurrencyPrefs';
import CurrencyBadge from '@/components/ui/CurrencyBadge';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  IndianRupee,
  Lightbulb,
  Loader2,
  NotebookPen,
  Plus,
  Repeat,
  Sparkles,
} from 'lucide-react';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const toApiLocalDateTime = (dateString) => (dateString ? `${dateString}T00:00:00` : '');

function today() {
  return new Date().toLocaleDateString('en-CA');
}

export default function AddIncome() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [category,   setCategory]   = useState(null);
  const [date,       setDate]       = useState(today());
  const [amount,     setAmount]     = useState('');
  const [note,       setNote]       = useState('');

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── recurring state ──────────────────────────────────────────────────────
  const [isRecurring,  setIsRecurring]  = useState(false);
  const [frequency,    setFrequency]    = useState('monthly');
  const [recurEndDate, setRecurEndDate] = useState('');

  // ── currency ──────────────────────────────────────────────────────────────
  const { currencies, defaultCurrency } = useCurrencyPrefs();
  const [currency, setCurrency] = useState('USD');
  useEffect(() => { if (defaultCurrency) setCurrency(defaultCurrency); }, [defaultCurrency]);
  const currencyObj = currencies.find((c) => c.code === currency) ?? { symbol: '$', code: currency };

  // ── fetch categories ──────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) return;
      setCategories(await res.json());
    } catch { /* silent */ }
  }, []);

  const [seedLoading, setSeedLoading] = useState(false);

  const seedIfEmpty = useCallback(async () => {
    const token = getToken();
    if (!token || seedLoading) return;
    setSeedLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories/seed`, {
        method: 'POST',
        headers: { Authorization: `jwt ${token}` },
      });
      await fetchCategories();
    } catch { /* silent */ }
    finally { setSeedLoading(false); }
  }, [fetchCategories, seedLoading]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!seedLoading && categories.length === 0) seedIfEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  // ── add category inline ─────────────────────────────────────────────────
  const handleAddCategory = async (name) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to create category');
    }
    await fetchCategories();
  };

  // ── validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!date)                          e.date     = 'Date is required';
    if (!category)                      e.category = 'Please select a category';
    if (!amount || Number(amount) <= 0) e.amount   = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field) => setErrors((p) => ({ ...p, [field]: '' }));

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = getToken();

      if (isRecurring) {
        const recurRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-incomes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
          body: JSON.stringify({
            category: category._id,
            amount: Number(amount),
            note,
            currency,
            frequency,
            startDate: toApiLocalDateTime(date),
            endDate: recurEndDate ? toApiLocalDateTime(recurEndDate) : null,
          }),
        });
        if (!recurRes.ok) {
          const d = await recurRes.json().catch(() => ({}));
          throw new Error(d.error || 'Failed to create recurring income');
        }
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
          body: JSON.stringify({ date: toApiLocalDateTime(date), category: category._id, amount: Number(amount), note, currency }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.message || 'Failed to add income');
        }
      }

      // Notify listeners to re-check (e.g. income-related alerts)
      window.dispatchEvent(new CustomEvent('income-added'));

      toast.success(isRecurring ? 'Recurring income set!' : 'Income added!');
      setSuccess(true);
      setTimeout(() => router.push('/income/list'), 900);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAmountSet = amount && Number(amount) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pt-6">
      {/* ── sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-300/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <IndianRupee className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">Add Income</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-none mt-0.5">Track your earnings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── amount hero card ─────────────────────────────────────────── */}
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 p-6">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">
              Amount <span className="text-rose-400">*</span>
            </label>

            <div className={`flex items-center gap-3 mb-5 pb-5 border-b border-slate-300 dark:border-slate-700 transition-all duration-200 ${isAmountSet ? 'opacity-100' : 'opacity-70'}`}>
              <CurrencyBadge value={currency} onChange={setCurrency} currencies={currencies} size="lg" />
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); clearError('amount'); }}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                min="0"
                step="1"
                className={`flex-1 text-5xl font-black tracking-tight bg-transparent outline-none placeholder:text-slate-700 ${errors.amount ? 'text-rose-400' : 'text-slate-900 dark:text-white'}`}
                style={{ minWidth: 0 }}
              />
              {isAmountSet && (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>

            {errors.amount && <p className="text-xs text-rose-500 font-semibold -mt-3 mb-4">{errors.amount}</p>}

            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Quick select</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setAmount(v.toString()); clearError('amount'); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-150 ${
                      Number(amount) === v
                        ? 'bg-slate-200 text-slate-900 border-slate-200 shadow-md'
                        : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {currencyObj.symbol}{v.toLocaleString('en-US')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── details card ──────────────────────────────────────────────── */}
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 divide-y divide-slate-700">

            {/* category */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Category <span className="text-rose-400">*</span>
              </label>
              <IncomeCategoryPicker
                categories={categories}
                value={category}
                onChange={(v) => { setCategory(v); clearError('category'); }}
                onAddCategory={handleAddCategory}
                placeholder="Pick a category"
                error={errors.category}
              />
              {errors.category && <p className="text-xs text-rose-500 font-semibold mt-2">{errors.category}</p>}
            </div>

            {/* date */}
            <div className="px-6 py-5">
              <label htmlFor="date" className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                <CalendarDays className="w-3.5 h-3.5" />
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); clearError('date'); }}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-200/50 dark:bg-slate-700/50 [color-scheme:dark] outline-none transition-all focus:ring-2 focus:ring-emerald-500 ${
                  errors.date ? 'border-rose-500/50 ring-2 ring-rose-500/20' : 'border-slate-600'
                }`}
              />
              {errors.date && <p className="text-xs text-rose-500 font-semibold mt-2">{errors.date}</p>}
            </div>

            {/* note */}
            <div className="px-6 py-5">
              <label htmlFor="note" className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                <NotebookPen className="w-3.5 h-3.5" />
                Note
                <span className="ml-auto font-normal normal-case tracking-normal text-slate-600">{note.length}/500</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="What was this income for?"
                className="w-full px-4 py-3 border border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-200/50 dark:bg-slate-700/50 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* ── recurring card ───────────────────────────────────────────── */}
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-400/20 divide-y divide-slate-700">
            {/* toggle row */}
            <div className="px-6 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Recurring</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRecurring((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isRecurring ? 'bg-emerald-600' : 'bg-slate-600'
                }`}
                aria-pressed={isRecurring}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    isRecurring ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* frequency + end date */}
            {isRecurring && (
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Frequency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFrequency(f)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all duration-150 ${
                          frequency === f
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                            : 'bg-slate-200/50 dark:bg-slate-700/50 border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                    End Date <span className="font-normal normal-case tracking-normal text-slate-600">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={recurEndDate}
                    onChange={(e) => setRecurEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-200 [color-scheme:dark] outline-none transition-all focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 bg-slate-200/50 dark:bg-slate-700/50"
                  />
                </div>
                <p className="text-xs text-emerald-300/70">An income entry will be auto-created every {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : frequency === 'monthly' ? 'month' : 'year'} starting from the date above.</p>
              </div>
            )}
          </div>

          {/* ── actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-xl border border-slate-600 bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 hover:border-slate-500 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                success
                  ? 'bg-emerald-500 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/20 hover:shadow-emerald-500/30'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {success ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><Plus className="w-4 h-4" /> {isRecurring ? 'Set as Recurring' : 'Add Income'}</>
              )}
            </button>
          </div>

          {/* tips */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-300">Tips for better income tracking</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-400">
              {[
                'Categorise each income source for accurate analytics',
                'Add a note to remember the context later',
                'Log income the same day you receive it',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-0.5 w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </form>
      </div>
    </div>
  );
}