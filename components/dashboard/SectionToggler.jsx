"use client";

import { BarChart2, CalendarRange, Target, Brain, List } from "lucide-react";

const SECTIONS = [
  { key: "categories", label: "Category Breakdown", icon: BarChart2 },
  { key: "monthly", label: "Monthly Overview", icon: CalendarRange },
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
    <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Visible Panels
        </p>
        <button
          onClick={toggleAll}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
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
