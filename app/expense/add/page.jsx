'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authenticate';
import { CategoryPicker } from '@/components/categories/CategoryPicker';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  IndianRupee,
  Lightbulb,
  Loader2,
  NotebookPen,
  Plus,
  Sparkles,
} from 'lucide-react';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const toApiLocalDateTime = (dateString) => (dateString ? `${dateString}T00:00:00` : '');

function today() {
  return new Date().toLocaleDateString('en-CA');
}

export default function AddExpense() {
  const router = useRouter();

  const [categoryTree, setCategoryTree] = useState([]);
  const [seedLoading,  setSeedLoading]  = useState(false);

  const [category, setCategory] = useState(null);
  const [date,     setDate]     = useState(today());
  const [amount,   setAmount]   = useState('');
  const [note,     setNote]     = useState('');

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── fetch category tree ──────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.tree) setCategoryTree(data.tree);
    } catch { /* silent */ }
  }, []);

  const seedIfEmpty = useCallback(async () => {
    const token = getToken();
    if (!token || seedLoading) return;
    setSeedLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories/seed`, {
        method: 'POST',
        headers: { Authorization: `jwt ${token}` },
      });
      await fetchCategories();
    } catch { /* silent */ }
    finally { setSeedLoading(false); }
  }, [fetchCategories, seedLoading]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!seedLoading && categoryTree.length === 0) seedIfEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryTree.length]);

  // ── add new category via CategoryPicker callback ─────────────────────────
  const handleAddCategory = async (parentId, name, color) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const body = parentId ? { name, parentCategory: parentId } : { name, isParent: true };
    if (color) body.color = color;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
      body: JSON.stringify(body),
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
      const categoryId = category.subcategoryId || category.parentId;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify({ date: toApiLocalDateTime(date), category: categoryId, amount: Number(amount), note }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to add expense');
      }
      setSuccess(true);
      setTimeout(() => router.push('/expense/list'), 900);
    } catch (err) {
      setErrors((p) => ({ ...p, form: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const isAmountSet = amount && Number(amount) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 pt-18">
      {/* ── sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <IndianRupee className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Add Expense</h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Track your spending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* form error banner */}
          {errors.form && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 font-medium">
              {errors.form}
            </div>
          )}

          {/* ── amount hero card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Amount <span className="text-rose-400">*</span>
            </label>

            <div className={`flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 transition-all duration-200 ${isAmountSet ? 'opacity-100' : 'opacity-70'}`}>
              <span className="text-4xl font-black text-gray-300 select-none">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); clearError('amount'); }}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                min="0"
                step="1"
                className={`flex-1 text-5xl font-black tracking-tight bg-transparent outline-none placeholder:text-gray-200 ${errors.amount ? 'text-rose-500' : 'text-gray-900'}`}
                style={{ minWidth: 0 }}
              />
              {isAmountSet && (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
              )}
            </div>

            {errors.amount && <p className="text-xs text-rose-500 font-semibold -mt-3 mb-4">{errors.amount}</p>}

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick select</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setAmount(v.toString()); clearError('amount'); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-150 ${
                      Number(amount) === v
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    ${v.toLocaleString('en-US')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── details card ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm divide-y divide-gray-100">

            {/* category */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Category <span className="text-rose-400">*</span>
              </label>
              {seedLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading categories…
                </div>
              ) : (
                <CategoryPicker
                  tree={categoryTree}
                  value={category}
                  onChange={(v) => { setCategory(v); clearError('category'); }}
                  onAddCategory={handleAddCategory}
                  placeholder="Pick a category"
                  error={errors.category}
                />
              )}
              {errors.category && <p className="text-xs text-rose-500 font-semibold mt-2">{errors.category}</p>}
            </div>

            {/* date */}
            <div className="px-6 py-5">
              <label htmlFor="date" className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                <CalendarDays className="w-3.5 h-3.5" />
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); clearError('date'); }}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
                  errors.date ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                }`}
              />
              {errors.date && <p className="text-xs text-rose-500 font-semibold mt-2">{errors.date}</p>}
            </div>

            {/* note */}
            <div className="px-6 py-5">
              <label htmlFor="note" className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                <NotebookPen className="w-3.5 h-3.5" />
                Note
                <span className="ml-auto font-normal normal-case tracking-normal text-gray-300">{note.length}/500</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="What was this expense for?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
              />
            </div>
          </div>

          {/* ── actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                success
                  ? 'bg-emerald-500 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-rose-500/20 hover:shadow-rose-500/30'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {success ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><Plus className="w-4 h-4" /> Add Expense</>
              )}
            </button>
          </div>

          {/* tips */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-blue-800">Tips for better tracking</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-blue-700">
              {[
                'Use sub-categories for precise reports (e.g. Necessities › Groceries)',
                'Add a note to remember the context later',
                'Log expenses the same day for accuracy',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-0.5 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
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
