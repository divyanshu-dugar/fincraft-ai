'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Inline currency picker for forms (amount fields).
 *
 * Props:
 *  - value:      string  — current currency code (e.g. 'USD')
 *  - onChange:   (code: string) => void
 *  - currencies: Array<{ code, symbol, name }> — user's configured currencies
 *  - size:       'sm' | 'lg'  (default 'lg') — lg for big amount hero card
 */
export default function CurrencyBadge({ value, onChange, currencies = [], size = 'lg' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = currencies.find((c) => c.code === value) ?? currencies[0] ?? { code: 'USD', symbol: '$', name: 'US Dollar' };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Single currency — show as plain label, no dropdown
  if (currencies.length <= 1) {
    return (
      <span className={`font-black text-slate-600 select-none ${size === 'lg' ? 'text-4xl' : 'text-base'}`}>
        {current.symbol}
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-xl font-black text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all duration-150 select-none group ${
          size === 'lg'
            ? 'text-4xl px-2 py-1'
            : 'text-sm px-2 py-1 border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg'
        }`}
        title="Change currency"
      >
        <span>{current.symbol}</span>
        {size === 'sm' && <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{current.code}</span>}
        <ChevronDown
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''} ${
            size === 'lg' ? 'w-5 h-5 mt-1' : 'w-3 h-3'
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[180px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 border-b border-slate-300/60 dark:border-slate-700/60">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your currencies</p>
          </div>
          <div className="py-1">
            {currencies.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-200/60 dark:hover:bg-slate-700/60 ${
                  c.code === value ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'
                }`}
              >
                <span className="w-7 text-base font-bold text-slate-600 dark:text-slate-400 shrink-0">{c.symbol}</span>
                <span className="flex-1">{c.name}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${
                  c.code === value ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>{c.code}</span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-300/60 dark:border-slate-700/60">
            <p className="text-[10px] text-slate-600">Manage currencies in Profile</p>
          </div>
        </div>
      )}
    </div>
  );
}
