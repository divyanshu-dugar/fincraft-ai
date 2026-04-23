"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, RotateCcw, X } from "lucide-react";

const TONES = {
  blue: {
    buttonActive: "border-blue-400/60 bg-blue-500/10 text-blue-400",
    buttonIdle: "border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-blue-400/60 hover:text-blue-400",
    panelBorder: "border-blue-400/20",
    icon: "text-blue-400",
    apply: "bg-blue-600 hover:bg-blue-700",
    presetActive: "border-blue-400 bg-blue-500/20 text-blue-400",
    presetIdle: "border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-blue-400/60 hover:text-blue-400",
    focus: "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20",
  },
  emerald: {
    buttonActive: "border-emerald-400/60 bg-emerald-500/10 text-emerald-400",
    buttonIdle: "border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-emerald-400/60 hover:text-emerald-400",
    panelBorder: "border-emerald-400/20",
    icon: "text-emerald-400",
    apply: "bg-emerald-600 hover:bg-emerald-700",
    presetActive: "border-emerald-400 bg-emerald-500/20 text-emerald-400",
    presetIdle: "border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-emerald-400/60 hover:text-emerald-400",
    focus: "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20",
  },
};

export default function CardDateRangeControl({
  tone = "blue",
  pageRange,
  overrideRange,
  onChange,
  presets = [],
  formatMonthLabel,
  loading = false,
}) {
  const styles = TONES[tone] || TONES.blue;
  const ref = useRef(null);
  const effectiveRange = overrideRange || pageRange;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(effectiveRange);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    if (!open) {
      setDraft(effectiveRange);
      setActivePreset(null);
    }
  }, [effectiveRange, open]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const label = useMemo(() => {
    const start = formatMonthLabel?.(effectiveRange?.startMonth) || effectiveRange?.startMonth;
    const end = formatMonthLabel?.(effectiveRange?.endMonth) || effectiveRange?.endMonth;
    return start && end ? `${start} → ${end}` : "Select range";
  }, [effectiveRange, formatMonthLabel]);

  const handleApply = () => {
    if (!draft?.startMonth || !draft?.endMonth) return;
    onChange?.(draft);
    setOpen(false);
  };

  const handleReset = () => {
    onChange?.(null);
    setDraft(pageRange);
    setActivePreset(null);
    setOpen(false);
  };

  const applyPreset = (preset) => {
    const now = new Date();
    const nextDraft = preset.months === null
      ? {
          startMonth: `${now.getFullYear()}-01`,
          endMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        }
      : {
          startMonth: `${new Date(now.getFullYear(), now.getMonth() - (preset.months - 1), 1).getFullYear()}-${String(new Date(now.getFullYear(), now.getMonth() - (preset.months - 1), 1).getMonth() + 1).padStart(2, "0")}`,
          endMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        };
    setDraft(nextDraft);
    setActivePreset(preset.label);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${open ? styles.buttonActive : styles.buttonIdle}`}
      >
        <Calendar className={`w-3.5 h-3.5 ${styles.icon}`} />
        <span className="hidden sm:inline">{overrideRange ? "Card range" : "Page range"}</span>
        <span>{label}</span>
      </button>

      {open && (
        <div className={`absolute right-0 top-full z-30 mt-2 w-[320px] rounded-2xl border ${styles.panelBorder} bg-slate-100/95 dark:bg-slate-800/95 p-4 shadow-2xl backdrop-blur-sm`}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customize card range</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                This changes only this chart card. Analytics remain month-based.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Start month
              </label>
              <input
                type="month"
                value={draft?.startMonth || ""}
                max={draft?.endMonth}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, startMonth: e.target.value }));
                  setActivePreset(null);
                }}
                className={`w-full rounded-xl border border-slate-600 bg-slate-200/50 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition-all dark:bg-slate-700/50 dark:text-slate-200 [color-scheme:dark] ${styles.focus}`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                End month
              </label>
              <input
                type="month"
                value={draft?.endMonth || ""}
                min={draft?.startMonth}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, endMonth: e.target.value }));
                  setActivePreset(null);
                }}
                className={`w-full rounded-xl border border-slate-600 bg-slate-200/50 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition-all dark:bg-slate-700/50 dark:text-slate-200 [color-scheme:dark] ${styles.focus}`}
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Quick range</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${activePreset === preset.label ? styles.presetActive : styles.presetIdle}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-300/50 pt-4 dark:border-slate-700/50">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Use page range
            </button>
            <button
              onClick={handleApply}
              disabled={!draft?.startMonth || !draft?.endMonth || loading}
              className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${styles.apply}`}
            >
              {loading ? "Updating..." : "Apply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
