'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getToken } from '@/lib/authenticate';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  FolderOpen,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── helpers ──────────────────────────────────────────────────────────────────

const ICON_OPTIONS = ['🏠','✨','💰','👤','📦','🛒','🍽️','☕','🎮','📚','💡','🚌','📱','🌐','🏥','🛡️','🛍️','📺','✈️','💪','🎁','❤️','🔖','📈','📊','🏦','💇','🆘','💳','🧾','🍫','🎬','🎵','🐾','👶','🏋️','🧹'];

function IconSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl border border-slate-600 flex items-center justify-center text-lg hover:border-blue-400/60 hover:bg-blue-500/10 transition-all">
        {value || '💰'}
      </button>
      {open && (
        <div className="absolute top-12 left-0 z-50 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 p-2 grid grid-cols-8 gap-1 w-72">
          {ICON_OPTIONS.map((ic) => (
            <button key={ic} type="button" onClick={() => { onChange(ic); setOpen(false); }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-blue-500/15 transition-colors ${value === ic ? 'bg-blue-500/20 ring-2 ring-blue-400' : ''}`}>
              {ic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── color palette ────────────────────────────────────────────────────────────

const COLOR_PALETTE = [
  '#3b82f6', '#60a5fa', '#2563eb',  // blues
  '#f59e0b', '#f97316', '#eab308',  // amber/orange/yellow
  '#22c55e', '#10b981', '#14b8a6',  // greens/teal
  '#8b5cf6', '#a855f7', '#6366f1',  // purples/indigo
  '#ef4444', '#f43f5e', '#ec4899',  // reds/pinks
  '#64748b', '#78716c', '#0ea5e9',  // slate/stone/sky
];

function ColorSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl border-2 border-slate-600 hover:border-slate-500 transition-all flex items-center justify-center"
        style={{ backgroundColor: value || '#64748b' }}
        title="Pick color"
      />
      {open && (
        <div className="absolute top-11 left-0 z-50 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 p-2 grid grid-cols-6 gap-1.5 w-52">
          {COLOR_PALETTE.map((c) => (
            <button key={c} type="button"
              onClick={() => { onChange(c); setOpen(false); }}
              className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${value === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── inline add/edit form ─────────────────────────────────────────────────────

function InlineForm({ initial = {}, onSave, onCancel, loading, placeholder = 'Category name', showColor = false }) {
  const [name, setName] = useState(initial.name || '');
  const [icon, setIcon] = useState(initial.icon || '💰');
  const [color, setColor] = useState(initial.color || '#64748b');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <IconSelect value={icon} onChange={setIcon} />
      {showColor && <ColorSelect value={color} onChange={setColor} />}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
      />
      <button type="submit" disabled={!name.trim() || loading}
        className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button type="button" onClick={onCancel} className="p-2.5 rounded-xl border border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700 transition-all">
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}

// ── delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({ item, isParent, childCount, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-300 dark:border-slate-700 w-full max-w-md p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Delete {isParent ? 'Group' : 'Subcategory'}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{item.icon} {item.name}</strong>?
              {isParent && childCount > 0 && (
                <span className="text-rose-400 font-semibold"> This will also delete {childCount} subcategor{childCount === 1 ? 'y' : 'ies'}.</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-all">
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

// ── subcategory row ──────────────────────────────────────────────────────────

function SubcategoryRow({ sub, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-200/50 dark:bg-slate-700/50 transition-all"
    >
      <span className="text-base">{sub.icon || '💰'}</span>
      <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{sub.name}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(sub)} className="p-1.5 rounded-lg hover:bg-blue-500/15 text-slate-500 hover:text-blue-400 transition-all">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(sub)} className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── parent group card ────────────────────────────────────────────────────────

function ParentGroupCard({ group, onEditParent, onDeleteParent, onAddSub, onEditSub, onDeleteSub }) {
  const [expanded, setExpanded] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const subs = group.subcategories || [];

  const handleAddSub = async (data) => {
    setActionLoading(true);
    try {
      await onAddSub(group._id, data);
      setAddingChild(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add subcategory');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSub = async (data) => {
    setActionLoading(true);
    try {
      await onEditSub(editingSub._id, data);
      setEditingSub(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-300/50 dark:border-slate-700/50 bg-slate-100/60 dark:bg-slate-800/60 hover:border-cyan-400/30 transition-all overflow-hidden"
    >
      {/* parent header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={() => setExpanded(!expanded)} className="p-1 rounded-lg hover:bg-slate-200/50 dark:bg-slate-700/50 transition-all">
          {expanded
            ? <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            : <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
        </button>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: group.color + '20' }}>
          {group.icon || '📁'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{group.name}</h3>
          <p className="text-xs text-slate-500">{subs.length} subcategor{subs.length === 1 ? 'y' : 'ies'}</p>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => { setAddingChild(true); setExpanded(true); }}
            className="p-2 rounded-lg hover:bg-emerald-500/15 text-slate-600 dark:text-slate-400 hover:text-emerald-400 transition-all" title="Add subcategory">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => onEditParent(group)}
            className="p-2 rounded-lg hover:bg-blue-500/15 text-slate-600 dark:text-slate-400 hover:text-blue-400 transition-all" title="Edit group">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => onDeleteParent(group)}
            className="p-2 rounded-lg hover:bg-rose-500/15 text-slate-600 dark:text-slate-400 hover:text-rose-400 transition-all" title="Delete group">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* subcategories */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-slate-300/50 dark:border-slate-700/50 px-4 py-2 space-y-0.5">
              <AnimatePresence>
                {subs.map((sub) =>
                  editingSub?._id === sub._id ? (
                    <div key={sub._id} className="py-1.5 px-1">
                      <InlineForm
                        initial={sub}
                        onSave={handleEditSub}
                        onCancel={() => setEditingSub(null)}
                        loading={actionLoading}
                        placeholder="Subcategory name"
                        showColor
                      />
                    </div>
                  ) : (
                    <SubcategoryRow
                      key={sub._id}
                      sub={sub}
                      onEdit={setEditingSub}
                      onDelete={(s) => onDeleteSub(s)}
                    />
                  )
                )}
              </AnimatePresence>

              {subs.length === 0 && !addingChild && (
                <p className="text-xs text-slate-500 text-center py-4">No subcategories yet</p>
              )}

              {addingChild && (
                <div className="py-1.5 px-1">
                  <InlineForm
                    initial={{ color: group.color }}
                    onSave={handleAddSub}
                    onCancel={() => setAddingChild(false)}
                    loading={actionLoading}
                    placeholder="New subcategory name"
                    showColor
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── main page ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function ExpenseCategoryPage() {
  const [tree, setTree] = useState([]);
  const [orphans, setOrphans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // ── fetch tree ──────────────────────────────────────────────────────────
  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API}/api/v1/expense-categories`, { headers: { Authorization: `jwt ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTree(data.tree || []);
      setOrphans(data.orphans || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  // ── API helpers ─────────────────────────────────────────────────────────
  const apiCall = async (method, rawPath, body = null) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const path = rawPath.startsWith('/api/') ? rawPath : `/api/v1${rawPath}`;
    const opts = { method, headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // ── parent group CRUD ──────────────────────────────────────────────────
  const handleAddGroup = async (data) => {
    setActionLoading(true);
    try {
      await apiCall('POST', '/expense-categories', { ...data, isParent: true });
      await fetchTree();
      setAddingGroup(false);
      toast.success('Group created');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGroup = async (data) => {
    setActionLoading(true);
    try {
      await apiCall('PUT', `/expense-categories/${editingGroup._id}`, data);
      await fetchTree();
      setEditingGroup(null);
      toast.success('Group updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await apiCall('DELETE', `/expense-categories/${deleteTarget._id}`);
      await fetchTree();
      setDeleteTarget(null);
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── subcategory CRUD ───────────────────────────────────────────────────
  const handleAddSubcategory = async (parentId, data) => {
    await apiCall('POST', '/expense-categories', { ...data, parentCategory: parentId });
    await fetchTree();
    toast.success('Subcategory added');
  };

  const handleEditSubcategory = async (id, data) => {
    await apiCall('PUT', `/expense-categories/${id}`, data);
    await fetchTree();
    toast.success('Subcategory updated');
  };

  // ── seed defaults ──────────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    try {
      await apiCall('POST', '/expense-categories/seed');
      await fetchTree();
      toast.success('Default categories restored');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSeeding(false);
    }
  };

  // ── derived data ───────────────────────────────────────────────────────
  const q = search.toLowerCase().trim();
  const filteredTree = q
    ? tree.map((g) => ({
        ...g,
        subcategories: (g.subcategories || []).filter((s) => s.name.toLowerCase().includes(q)),
      })).filter((g) => g.name.toLowerCase().includes(q) || g.subcategories.length > 0)
    : tree;

  const totalSubs = tree.reduce((acc, g) => acc + (g.subcategories?.length || 0), 0);
  const deleteChildCount = deleteTarget?.isParent
    ? (tree.find((g) => g._id === deleteTarget._id)?.subcategories?.length || 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 px-4 pb-6">
      <div className="max-w-4xl mx-auto">

        {/* ── header ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Layers className="w-5 h-5 text-slate-900 dark:text-white" />
                </div>
                Expense Categories
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-lg">
                Organize expenses into groups and subcategories for better tracking and insights.
              </p>
            </div>

            {/* stats */}
            <div className="flex items-center gap-3 text-sm">
              <div className="px-4 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">{tree.length}</span>
                <span className="text-slate-500 ml-1.5">groups</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">{totalSubs}</span>
                <span className="text-slate-500 ml-1.5">subcategories</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── toolbar ───────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3 mb-6">
          {/* search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all placeholder-slate-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* add group */}
          <button
            onClick={() => { setAddingGroup(true); setEditingGroup(null); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Group
          </button>

          {/* seed defaults */}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 border border-slate-600 rounded-xl hover:bg-slate-200/50 dark:bg-slate-700/50 disabled:opacity-50 transition-all"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Seed Defaults
          </button>
        </motion.div>

        {/* ── add new group form ────────────────────────────────────── */}
        <AnimatePresence>
          {addingGroup && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.25 }}
              className="mb-6"
            >
              <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-blue-500/30 p-5">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Create New Group
                </p>
                <InlineForm
                  onSave={handleAddGroup}
                  onCancel={() => setAddingGroup(false)}
                  loading={actionLoading}
                  placeholder="Group name (e.g. Necessities, Wants)"
                  showColor
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── edit group form ──────────────────────────────────────── */}
        <AnimatePresence>
          {editingGroup && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.25 }}
              className="mb-6"
            >
              <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-amber-500/30 p-5">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Group — {editingGroup.icon} {editingGroup.name}
                </p>
                <InlineForm
                  initial={editingGroup}
                  onSave={handleUpdateGroup}
                  onCancel={() => setEditingGroup(null)}
                  loading={actionLoading}
                  placeholder="Group name"
                  showColor
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── category tree ────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading categories…</span>
            </div>
          </div>
        ) : filteredTree.length === 0 && orphans.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 bg-slate-100/60 dark:bg-slate-800/60 rounded-3xl flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {search ? 'No matching categories' : 'No categories yet'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              {search
                ? 'Try a different search term.'
                : 'Get started by creating a group or seeding the default categories.'}
            </p>
            {!search && (
              <button onClick={handleSeed} disabled={seeding}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Seed Default Categories
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredTree.map((group, i) => (
              <motion.div key={group._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}>
                <ParentGroupCard
                  group={group}
                  onEditParent={(g) => { setEditingGroup(g); setAddingGroup(false); }}
                  onDeleteParent={(g) => setDeleteTarget(g)}
                  onAddSub={handleAddSubcategory}
                  onEditSub={handleEditSubcategory}
                  onDeleteSub={(s) => setDeleteTarget(s)}
                />
              </motion.div>
            ))}

            {/* orphans */}
            {orphans.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-300">Uncategorized ({orphans.length})</h3>
                </div>
                <p className="text-xs text-amber-400 mb-4">
                  These subcategories lost their parent group. You can delete them or recreate their parent.
                </p>
                <div className="space-y-1">
                  {orphans.map((o) => (
                    <div key={o._id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-700/50">
                      <span className="text-base">{o.icon || '💰'}</span>
                      <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{o.name}</span>
                      <button onClick={() => setDeleteTarget(o)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── tips ──────────────────────────────────────────────────── */}
        {!loading && (tree.length > 0 || orphans.length > 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-8 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <h3 className="text-sm font-bold text-blue-300 mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> Tips
            </h3>
            <ul className="text-xs text-blue-400 space-y-1.5">
              <li>• Click the <ChevronRight className="w-3 h-3 inline" /> arrow to expand a group and see subcategories</li>
              <li>• Use the <Plus className="w-3 h-3 inline" /> button on each group to add subcategories inline</li>
              <li>• Hover over a subcategory to reveal edit and delete actions</li>
              <li>• Deleting a group removes all its subcategories</li>
            </ul>
          </motion.div>
        )}
      </div>

      {/* ── delete confirmation modal ────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            item={deleteTarget}
            isParent={deleteTarget.isParent}
            childCount={deleteChildCount}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}