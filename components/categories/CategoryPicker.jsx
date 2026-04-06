'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Search, X, Plus, Check } from 'lucide-react';

/**
 * CategoryPicker
 *
 * Props:
 *  tree          – array of parent objects (each with .subcategories[])
 *  value         – { parentId, parentName, subcategoryId, subcategoryName } | null
 *  onChange      – (value) => void
 *  onAddCategory – (parentId|null, name) => Promise<category>   optional
 *  placeholder   – string
 *  error         – string | undefined
 */
export function CategoryPicker({ tree = [], value, onChange, onAddCategory, placeholder = 'Select category', error }) {
  const [open, setOpen]           = useState(false);
  const [step, setStep]           = useState('parent'); // 'parent' | 'child'
  const [hoverParent, setHover]   = useState(null);     // parent being hovered (desktop)
  const [search, setSearch]       = useState('');
  const [adding, setAdding]       = useState(false);    // showing add-new input
  const [newName, setNewName]     = useState('');
  const [addLoading, setAddLoad]  = useState(false);
  const [addError, setAddErr]     = useState('');
  const ref                       = useRef(null);
  const searchRef                 = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  function close() {
    setOpen(false);
    setStep('parent');
    setHover(null);
    setSearch('');
    setAdding(false);
    setNewName('');
    setAddErr('');
  }

  function selectSub(parent, sub) {
    onChange({ parentId: parent._id, parentName: parent.name, parentIcon: parent.icon, subcategoryId: sub._id, subcategoryName: sub.name, subcategoryIcon: sub.icon });
    close();
  }

  function selectParentAsLeaf(parent) {
    // Allow selecting a parent directly (no sub-categories or user wants generic)
    onChange({ parentId: parent._id, parentName: parent.name, parentIcon: parent.icon, subcategoryId: null, subcategoryName: null });
    close();
  }

  const q = search.toLowerCase().trim();

  // Flat search results across the whole tree
  const searchResults = q
    ? tree.flatMap((p) => [
        ...(p.name.toLowerCase().includes(q) ? [{ parent: p, sub: null }] : []),
        ...(p.subcategories || [])
          .filter((s) => s.name.toLowerCase().includes(q))
          .map((s) => ({ parent: p, sub: s })),
      ])
    : [];

  // Keep hoverParent in sync with the latest tree data (e.g. after adding a subcategory)
  const resolvedHover = hoverParent ? tree.find((p) => p._id === hoverParent._id) || hoverParent : null;

  const activeParent = resolvedHover || (step === 'child' && value?.parentId
    ? tree.find((p) => p._id === value.parentId)
    : tree[0]);

  async function handleAddNew() {
    if (!newName.trim()) { setAddErr('Name is required'); return; }
    if (!onAddCategory)  { setAddErr('Add not supported'); return; }
    setAddLoad(true);
    setAddErr('');
    try {
      const parentId = step === 'child' ? (hoverParent?._id || null) : null;
      // Inherit parent's color for subcategories
      const color = step === 'child' && resolvedHover?.color ? resolvedHover.color : undefined;
      await onAddCategory(parentId, newName.trim(), color);
      setAdding(false);
      setNewName('');
    } catch (e) {
      setAddErr(e.message || 'Failed to create category');
    } finally {
      setAddLoad(false);
    }
  }

  // ── display label in trigger ─────────────────────────────────────────────
  const label = value?.subcategoryName
    ? `${value.parentIcon || ''} ${value.parentName} › ${value.subcategoryIcon || ''} ${value.subcategoryName}`.trim()
    : value?.parentName
    ? `${value.parentIcon || ''} ${value.parentName}`.trim()
    : null;

  return (
    <div ref={ref} className="relative w-full">
      {/* ── trigger button ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); if (!open) setStep('parent'); }}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border bg-white text-left transition-all duration-150 ${
          open
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
            : error
            ? 'border-rose-300 ring-2 ring-rose-100'
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        }`}
      >
        <span className={`flex items-center gap-2 flex-1 min-w-0 text-sm font-medium ${label ? 'text-gray-900' : 'text-gray-400'}`}>
          {label ? (
            <>
              <span className="text-base leading-none">{value?.subcategoryIcon || value?.parentIcon || '💰'}</span>
              <span className="truncate">
                <span className="text-gray-500">{value.parentName}</span>
                {value.subcategoryName && (
                  <>
                    <span className="mx-1.5 text-gray-300">›</span>
                    <span className="text-gray-900 font-semibold">{value.subcategoryName}</span>
                  </>
                )}
              </span>
            </>
          ) : placeholder}
        </span>
        <span className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </button>

      {/* ── dropdown panel ──────────────────────────────────────────────── */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/80 overflow-hidden"
          style={{ minWidth: 280 }}>

          {/* search */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setStep('parent'); }}
                placeholder="Search categories…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── search results view ─────────────────────────────────────── */}
          {q ? (
            <div className="max-h-72 overflow-y-auto px-2 pb-2">
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No results for "{search}"</p>
              ) : (
                searchResults.map(({ parent, sub }, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sub ? selectSub(parent, sub) : selectParentAsLeaf(parent)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors group"
                  >
                    <span className="text-base leading-none">{sub ? (sub.icon || '💰') : (parent.icon || '📁')}</span>
                    <span className="flex-1 min-w-0">
                      {sub ? (
                        <>
                          <span className="text-xs text-gray-400">{parent.name} › </span>
                          <span className="text-sm font-semibold text-gray-800">{sub.name}</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-gray-800">{parent.name}</span>
                      )}
                    </span>
                    <Check className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          ) : (
            /* ── two-column: parents left, subs right ─────────────────── */
            <div className="flex" style={{ minHeight: 240 }}>
              {/* parent list */}
              <div className="w-1/2 border-r border-gray-100 max-h-80 overflow-y-auto py-1">
                {tree.map((parent) => {
                  const isActive = activeParent?._id === parent._id;
                  return (
                    <button
                      key={parent._id}
                      type="button"
                      onMouseEnter={() => setHover(parent)}
                      onClick={() => {
                        setHover(parent);
                        if (!parent.subcategories?.length) selectParentAsLeaf(parent);
                        else setStep('child');
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: `${parent.color}20` }}
                      >
                        {parent.icon || '📁'}
                      </span>
                      <span className={`flex-1 text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        {parent.name}
                      </span>
                      {parent.subcategories?.length > 0 && (
                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-300'}`} />
                      )}
                    </button>
                  );
                })}
                {onAddCategory && (
                  <button
                    type="button"
                    onClick={() => { setAdding(true); setStep('parent'); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> New group
                  </button>
                )}
              </div>

              {/* sub-category list */}
              <div className="w-1/2 max-h-80 overflow-y-auto py-1">
                {activeParent && (activeParent.subcategories?.length > 0) ? (
                  activeParent.subcategories.map((sub) => {
                    const isSelected = value?.subcategoryId === sub._id;
                    return (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => selectSub(activeParent, sub)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm leading-none flex-shrink-0">{sub.icon || '💰'}</span>
                        <span className={`flex-1 text-sm truncate ${isSelected ? 'font-bold text-blue-700' : 'font-medium text-gray-700'}`}>
                          {sub.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                      </button>
                    );
                  })
                ) : activeParent ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
                    <span className="text-2xl mb-2">{activeParent.icon || '📁'}</span>
                    <p className="text-xs text-gray-400">No sub-categories yet</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-gray-400 px-4 text-center">Hover a group to see sub-categories</p>
                  </div>
                )}

                {onAddCategory && activeParent && (
                  <button
                    type="button"
                    onClick={() => { setHover(activeParent); setStep('child'); setAdding(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> New sub-category
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── inline add form ─────────────────────────────────────────── */}
          {adding && (
            <div className="border-t border-gray-100 px-3 py-3 bg-gray-50/50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {hoverParent ? `New sub-category under "${hoverParent.name}"` : 'New top-level group'}
              </p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setAddErr(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNew(); } if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
                  placeholder="Category name…"
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={handleAddNew}
                  disabled={addLoading}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {addLoading ? '…' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setNewName(''); setAddErr(''); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {addError && <p className="text-xs text-rose-600 mt-1.5">{addError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Named ChevronDown locally to avoid import naming conflict
function ChevronDown({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
