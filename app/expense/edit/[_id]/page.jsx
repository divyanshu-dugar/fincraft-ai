'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getToken } from '@/lib/authenticate';
import { CategoryPicker } from '@/components/categories/CategoryPicker';
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

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const toApiLocalDateTime = (dateString) => (dateString ? `${dateString}T00:00:00` : '');

const EditExpense = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const returnUrl = (() => {
    const m = searchParams.get('month');
    const y = searchParams.get('year');
    return m !== null && y !== null
      ? `/expense/list?month=${m}&year=${y}`
      : '/expense/list';
  })();

  const [categoryTree, setCategoryTree] = useState([]);
  const [category, setCategory] = useState(null);

  const [date,   setDate]   = useState('');
  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');
  const [currency, setCurrency] = useState('USD');

  // ── currency prefs ─────────────────────────────────────────────────────────
  const { currencies } = useCurrencyPrefs();
  const currencyObj = currencies.find((c) => c.code === currency) ?? { symbol: '$', code: currency };

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── fetch category tree ──────────────────────────────────────────────────
  const fetchCategoryTree = useCallback(async () => {
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
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories/seed`, {
        method: 'POST',
        headers: { Authorization: `jwt ${token}` },
      });
      await fetchCategoryTree();
    } catch { /* silent */ }
  }, [fetchCategoryTree]);

  // ── fetch expense ────────────────────────────────────────────────────────
  const fetchExpense = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${params._id}`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) {
        setErrors({ form: 'Failed to load expense.' });
        return;
      }
      const data = await res.json();
      setDate(data.date.split('T')[0]);
      setAmount(String(data.amount));
      setNote(data.note || '');
      setCurrency(data.currency || 'USD');

      if (data.category) {
        const cat = data.category;
        if (cat.parentCategory) {
          setCategory({
            parentId: cat.parentCategory._id || cat.parentCategory,
            parentName: cat.parentCategory.name || '',
            parentIcon: cat.parentCategory.icon || '',
            subcategoryId: cat._id,
            subcategoryName: cat.name,
            subcategoryIcon: cat.icon || '',
          });
        } else {
          setCategory({
            parentId: cat._id,
            parentName: cat.name,
            parentIcon: cat.icon || '',
            subcategoryId: null,
            subcategoryName: null,
          });
        }
      }
    } catch {
      setErrors({ form: 'An error occurred while fetching the expense.' });
    } finally {
      setLoading(false);
    }
  }, [params._id]);

  useEffect(() => {
    fetchCategoryTree();
    fetchExpense();
  }, [fetchCategoryTree, fetchExpense]);

  useEffect(() => {
    if (categoryTree.length === 0 && !loading) seedIfEmpty();
  }, [categoryTree.length, loading, seedIfEmpty]);

  // ── add category from picker ─────────────────────────────────────────────
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
    await fetchCategoryTree();
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
      const categoryId = category.subcategoryId || category.parentId;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${params._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify({
          date: toApiLocalDateTime(date),
          category: categoryId,
          amount: Number(amount),
          note,
          currency,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to update expense');
      }
      toast.success('Expense updated!');
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${params._id}`, {
        method: 'DELETE',
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      toast.success('Expense deleted.');
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
    return <EditFormSkeleton accentColor="bg-gradient-to-br from-blue-500 to-indigo-600" />;
  }

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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <IndianRupee className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">Edit Expense</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-none mt-0.5">Update your record</p>
            </div>
          </div>

          {/* delete button in header */}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="ml-auto p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
            title="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── amount hero card ─────────────────────────────────────────── */}
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300 dark:border-slate-700 p-6">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">
              Amount <span className="text-rose-400">*</span>
            </label>

            <div className={`flex items-center gap-3 mb-5 pb-5 border-b border-slate-300/50 dark:border-slate-700/50 transition-all duration-200 ${isAmountSet ? 'opacity-100' : 'opacity-70'}`}>
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
                className={`flex-1 text-5xl font-black tracking-tight bg-transparent outline-none placeholder:text-slate-700 ${errors.amount ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}
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
                        ? 'bg-gray-900 text-slate-900 dark:text-white border-gray-900 shadow-md'
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
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300 dark:border-slate-700 divide-y divide-slate-700/50">

            {/* category */}
            <div className="px-6 py-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Category <span className="text-rose-400">*</span>
              </label>
              <CategoryPicker
                tree={categoryTree}
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
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-800 dark:text-slate-200 [color-scheme:dark] outline-none transition-all focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 bg-slate-200/50 dark:bg-slate-700/50 ${
                  errors.date ? 'border-rose-400 ring-2 ring-rose-400/20' : 'border-slate-600'
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
                placeholder="What was this expense for?"
                className="w-full px-4 py-3 border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all resize-none"
              />
            </div>
          </div>

          {/* ── actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1 px-6 py-3.5 rounded-xl border border-slate-600 bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 transition-all disabled:opacity-40"
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

      {/* ── delete confirmation overlay ───────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-300 dark:border-slate-700 w-full max-w-sm p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Delete Expense</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  This action cannot be undone. Are you sure you want to delete this expense?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditExpense;
