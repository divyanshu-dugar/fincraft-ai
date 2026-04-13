"use client";

import { BarChart2, CalendarRange, Target, Brain, List, Activity } from "lucide-react";

const SECTIONS = [
  { key: "categories", label: "Category Breakdown", icon: BarChart2 },
  { key: "monthly", label: "Monthly Overview", icon: CalendarRange },
  { key: "forecast", label: "Cash Flow Forecast", icon: Activity },
  { key: "budgets", label: "Budget Health", icon: Target },
  { key: "insights", label: "AI Insights", icon: Brain },
  { key: "transactions", label: "Transactions", icon: List },
];

export function SectionToggler({ activeSections, toggleSection }) {
  const allOn = SECTIONS.every(({ key }) => activeSections[key]);

  const toggleAll = () => {
    SECTIONS.forEach(({ key }) => {
      const shouldBeOn = !allOn;
      if (activeSections[key] !== shouldBeOn) toggleSection(key);
    });
  };

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-cyan-400/20 shadow-sm p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Visible Panels
        </p>
        <button
          onClick={toggleAll}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {allOn ? "Collapse All" : "Expand All"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(({ key, label, icon: Icon }) => {
          const isActive = activeSections[key];
          return (
            <button
              key={key}
              onClick={() => toggleSection(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
                  : "bg-slate-700/50 text-slate-400 border-slate-600 hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-slate-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
