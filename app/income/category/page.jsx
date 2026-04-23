'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getToken } from '@/lib/authenticate';
import { CategoryListSkeleton } from '@/components/skeletons/PageSkeletons';
import {
  AlertTriangle,
  Check,
  Edit3,
  Loader2,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── color palette ────────────────────────────────────────────────────────────
const COLOR_PALETTE = [
  '#10b981', '#22c55e', '#14b8a6', '#34d399',
  '#3b82f6', '#60a5fa', '#6366f1', '#8b5cf6',
  '#f59e0b', '#f97316', '#ef4444', '#f43f5e',
  '#64748b', '#0ea5e9', '#a855f7', '#ec4899',
];

const ICON_OPTIONS = [
  '💰','💵','💳','🏦','📈','📊','💼','🏠','🚗','✈️',
  '🎁','🛒','🍽️','☕','📱','💡','🎮','📚','🏥','🛡️',
  '💪','❤️','👶','🐾','🎵','🎬','🌐','🔖',
];

function IconSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-xl border border-slate-600 flex items-center justify-center text-lg hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
        {value || '💰'}
      </button>
      {open && (
        <div className="absolute top-12 left-0 z-50 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-300 dark:border-slate-700 p-2 grid grid-cols-7 gap-1 w-60">
          {ICON_OPTIONS.map((ic) => (
            <button key={ic} type="button" onClick={() => { onChange(ic); setOpen(false); }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-emerald-500/15 transition-colors ${value === ic ? 'bg-emerald-500/20 ring-2 ring-emerald-400' : ''}`}>
              {ic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-xl border-2 border-slate-600 hover:border-slate-500 transition-all"
        style={{ backgroundColor: value || '#10b981' }}
        title="Pick color"
      />
      {open && (
        <div className="absolute top-11 left-0 z-50 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-300 dark:border-slate-700 p-2 grid grid-cols-4 gap-1.5 w-44">
          {COLOR_PALETTE.map((c) => (
            <button key={c} type="button"
              onClick={() => { onChange(c); setOpen(false); }}
              className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${value === c ? 'ring-2 ring-offset-1 ring-emerald-500' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── inline form ──────────────────────────────────────────────────────────────
function InlineForm({ initial = {}, onSave, onCancel, loading, placeholder = 'Category name' }) {
  const [name,  setName]  = useState(initial.name  || '');
  const [icon,  setIcon]  = useState(initial.icon  || '💰');
  const [color, setColor] = useState(initial.color || '#10b981');
  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim()) return; onSave({ name: name.trim(), icon, color }); };
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <IconSelect value={icon} onChange={setIcon} />
      <ColorSelect value={color} onChange={setColor} />
      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder={placeholder} autoFocus
        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-200/50 dark:bg-slate-700/50 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 placeholder:text-slate-500 transition-all" />
      <button type="submit" disabled={!name.trim() || loading}
        className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button type="button" onClick={onCancel}
        className="p-2.5 rounded-xl border border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700 transition-all">
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}

// ── delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-100/95 dark:bg-slate-800/95 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Delete Category</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Are you sure you want to delete <strong>{item.icon} {item.name}</strong>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-all disabled:opacity-40">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── category card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 hover:border-cyan-400/30 transition-all"
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: (cat.color || '#10b981') + '22', border: `2px solid ${cat.color || '#10b981'}55` }}
      >
        {cat.icon || '💰'}
      </span>
      <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-0 truncate">{cat.name}</span>
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: cat.color || '#10b981' }}
        title={cat.color}
      />
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(cat)}
          className="p-1.5 rounded-lg hover:bg-blue-500/15 text-slate-500 hover:text-blue-400 transition-all" title="Edit">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(cat)}
          className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-all" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── main page ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function IncomeCategoryPage() {
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [adding,        setAdding]        = useState(false);
  const [editingCat,    setEditingCat]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API}/income-categories`, { headers: { Authorization: `jwt ${token}` } });
      if (!res.ok) throw new Error();
      setCategories(await res.json());
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAdd = async (data) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/income-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed to create'); }
      await fetchCategories();
      setAdding(false);
      toast.success('Category created!');
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/income-categories/${editingCat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed to update'); }
      await fetchCategories();
      setEditingCat(null);
      toast.success('Category updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/income-categories/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchCategories();
      setDeleteTarget(null);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pt-18">
      {/* delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            item={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* ── sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-300/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Tags className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">Income Categories</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-none mt-0.5">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => { setAdding(true); setEditingCat(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Category
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── add form ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-emerald-500/30 shadow-sm p-5"
            >
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">New Category</p>
              <InlineForm
                onSave={handleAdd}
                onCancel={() => setAdding(false)}
                loading={actionLoading}
                placeholder="e.g. Salary, Freelance, Investments…"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── search ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="flex-1 text-sm outline-none bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-700 dark:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── list ──────────────────────────────────────────────────────────── */}
        {loading ? (
          <CategoryListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Tags className="w-7 h-7 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {search ? 'No matching categories' : 'No categories yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              {search ? 'Try a different search term.' : 'Organize your income streams by creating categories like Salary, Freelance, or Investments.'}
            </p>
            {!search && (
              <button
                onClick={() => setAdding(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                <span className="text-base">+</span> Create Your First Category
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((cat) =>
                editingCat?._id === cat._id ? (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-blue-500/30 shadow-sm p-5"
                  >
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">Edit Category</p>
                    <InlineForm
                      initial={cat}
                      onSave={handleEdit}
                      onCancel={() => setEditingCat(null)}
                      loading={actionLoading}
                    />
                  </motion.div>
                ) : (
                  <CategoryCard
                    key={cat._id}
                    cat={cat}
                    onEdit={setEditingCat}
                    onDelete={setDeleteTarget}
                  />
                )
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
