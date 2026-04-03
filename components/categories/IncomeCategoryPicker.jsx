'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Loader2, Plus, Search, X } from 'lucide-react';

/**
 * IncomeCategoryPicker
 *
 * Props:
 *  categories   – flat array of { _id, name, icon, color }
 *  value        – selected category object | null
 *  onChange     – (category) => void
 *  onAddCategory – (name) => Promise<void>  optional – inline "add new" support
 *  placeholder  – string
 *  error        – string | undefined
 */
export function IncomeCategoryPicker({
  categories = [],
  value,
  onChange,
  onAddCategory,
  placeholder = 'Select category',
  error,
}) {
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState('');
  const [adding, setAdding]     = useState(false);
  const [newName, setNewName]   = useState('');
  const [addLoading, setAddLoad]= useState(false);
  const [addError, setAddErr]   = useState('');
  const ref                     = useRef(null);
  const searchRef               = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  function close() {
    setOpen(false);
    setSearch('');
    setAdding(false);
    setNewName('');
    setAddErr('');
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAddLoad(true);
    setAddErr('');
    try {
      await onAddCategory(name);
      setAdding(false);
      setNewName('');
    } catch (err) {
      setAddErr(err.message || 'Failed to create category');
    } finally {
      setAddLoad(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
          error
            ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50'
            : open
            ? 'border-blue-400 ring-2 ring-blue-100 bg-white'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        {value ? (
          <>
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: value.color + '22', border: `2px solid ${value.color}55` }}
            >
              {value.icon || '💰'}
            </span>
            <span className="flex-1 text-left text-gray-800">{value.name}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 text-left text-gray-400">{placeholder}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 min-w-0"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Category list */}
          <div className="max-h-60 overflow-y-auto py-1.5">
            {filtered.length === 0 && !adding && (
              <p className="text-sm text-gray-400 text-center py-6">No categories found</p>
            )}
            {filtered.map((cat) => {
              const selected = value?._id === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => { onChange(cat); close(); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: cat.color + '22', border: `2px solid ${cat.color}55` }}
                  >
                    {cat.icon || '💰'}
                  </span>
                  <span className={`flex-1 text-left text-sm font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {cat.name}
                  </span>
                  {selected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Add new */}
          {onAddCategory && (
            <div className="border-t border-gray-100 p-3">
              {adding ? (
                <form onSubmit={handleAdd} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Category name"
                    autoFocus
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newName.trim() || addLoading}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all"
                  >
                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAdding(false); setNewName(''); setAddErr(''); }}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 border border-dashed border-emerald-300 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add new category
                </button>
              )}
              {addError && <p className="text-xs text-rose-500 mt-1.5 font-medium">{addError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
