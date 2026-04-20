'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getToken } from '@/lib/authenticate';
import { IncomeCategoryPicker } from '@/components/categories/IncomeCategoryPicker';
import { useCurrencyPrefs } from '@/lib/hooks/useCurrencyPrefs';
import CurrencyBadge from '@/components/ui/CurrencyBadge';
import { EditFormSkeleton } from '@/components/skeletons/PageSkeletons';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  IndianRupee,
  Loader2,
  NotebookPen,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const toApiLocalDateTime = (dateString) => (dateString ? `${dateString}T00:00:00` : '');

export default function EditIncome() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const returnUrl = (() => {
    const m = searchParams.get('month');
    const y = searchParams.get('year');
    return m !== null && y !== null
      ? `/income/list?month=${m}&year=${y}`
      : '/income/list';
  })();

  const [categories, setCategories] = useState([]);
  const [category,   setCategory]   = useState(null);

  const [date,   setDate]   = useState('');
  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');
  const [currency, setCurrency] = useState('USD');

  // ── currency prefs ─────────────────────────────────────────────────────────
  const { currencies } = useCurrencyPrefs();
  const currencyObj = currencies.find((c) => c.code === currency) ?? { symbol: '$', code: currency };

  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── fetch categories ──────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) return;
      return await res.json();
    } catch { return []; }
  }, []);

  // ── fetch income & hydrate ────────────────────────────────────────────────
  const fetchIncome = useCallback(async (cats) => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income/${params._id}`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) { setErrors({ form: 'Failed to load income.' }); return; }
      const data = await res.json();
      setDate(data.date.split('T')[0]);
      setAmount(String(data.amount));
      setNote(data.note || '');
      setCurrency(data.currency || 'USD');
      // Resolve category object from id
      if (data.category) {
        const catId = data.category._id || data.category;
        const found = (cats || []).find((c) => c._id === catId);
        setCategory(found || null);
      }
    } catch {
      setErrors({ form: 'An error occurred while fetching the income.' });
    } finally {
      setLoading(false);
    }
  }, [params._id]);

  const seedIfEmpty = useCallback(async (cats) => {
    if (cats && cats.length > 0) return;
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories/seed`, {
        method: 'POST',
        headers: { Authorization: `jwt ${token}` },
      });
      const refreshed = await fetchCategories();
      setCategories(refreshed || []);
    } catch { /* silent */ }
  }, [fetchCategories]);

  useEffect(() => {
    (async () => {
      const cats = await fetchCategories();
      setCategories(cats || []);
      await fetchIncome(cats || []);
      seedIfEmpty(cats);
    })();
  }, [fetchCategories, fetchIncome, seedIfEmpty]);

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
    const cats = await fetchCategories();
    setCategories(cats || []);
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
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income/${params._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify({ date: toApiLocalDateTime(date), category: category._id, amount: Number(amount), note, currency }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to update income');
      }
      toast.success('Income updated!');
      setSuccess(true);
      setTimeout(() => router.push(returnUrl), 900);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income/${params._id}`, {
        method: 'DELETE',
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete income');
      toast.success('Income deleted.');
      router.push(returnUrl);
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const isAmountSet = amount && Number(amount) > 0;

  if (loading) {
    return <EditFormSkeleton accentColor="bg-gradient-to-br from-emerald-500 to-green-600" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pt-18">
      {/* ── delete confirm overlay ─────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-100/95 dark:bg-slate-800/95 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 max-w-sm w-full">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">Delete Income?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-7">
              This action cannot be undone. The income record will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 transition-all disabled:opacity-40"
              >
                Keep it
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <IndianRupee className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">Edit Income</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-none mt-0.5">Update your record</p>
            </div>
          </div>
          {/* delete button in header */}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="ml-auto p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
            title="Delete income"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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

          {/* ── actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1 px-6 py-3.5 rounded-xl border border-slate-600 bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 hover:border-slate-500 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                success
                  ? 'bg-emerald-500 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/20 hover:shadow-blue-500/30'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {success ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}