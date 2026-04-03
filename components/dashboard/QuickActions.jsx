"use client";

import {
  CreditCard,
  DollarSign,
  Target,
  BarChart2,
  TrendingUp,
  List,
  BookOpen,
  PieChart,
  Plus,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

const primaryActions = [
  {
    label: "Add Expense",
    icon: CreditCard,
    route: "/expense/add",
    style: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
  },
  {
    label: "Add Income",
    icon: DollarSign,
    route: "/income/add",
    style: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
  },
  {
    label: "Add Goal",
    icon: Target,
    route: "/goal/list",
    style: "bg-purple-600 hover:bg-purple-700 shadow-purple-200",
  },
];

const quickLinks = [
  {
    label: "Expense Analytics",
    icon: BarChart2,
    route: "/expense/analytics",
    style: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200",
    badge: "Insights",
  },
  {
    label: "Income Analytics",
    icon: TrendingUp,
    route: "/income/analytics",
    style: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    badge: "Insights",
  },
  {
    label: "Expense List",
    icon: List,
    route: "/expense/list",
    style: "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200",
    badge: null,
  },
  {
    label: "Income List",
    icon: BookOpen,
    route: "/income/list",
    style: "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200",
    badge: null,
  },
  {
    label: "Budgets",
    icon: PieChart,
    route: "/budget/list",
    style: "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200",
    badge: null,
  },
  {
    label: "Categories",
    icon: Zap,
    route: "/expense/category",
    style: "text-violet-600 bg-violet-50 hover:bg-violet-100 border-violet-200",
    badge: null,
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="mb-8 space-y-3">
      {/* Primary action buttons */}
      <div className="grid grid-cols-3 gap-3">
        {primaryActions.map(({ label, icon: Icon, route, style }) => (
          <button
            key={label}
            onClick={() => router.push(route)}
            className={`flex items-center justify-center gap-2 ${style} text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all`}
          >
            <Plus size={15} strokeWidth={2.5} />
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden text-xs">{label.split(" ")[1]}</span>
          </button>
        ))}
      </div>

      {/* Quick navigation links */}
      <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Quick Links
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickLinks.map(({ label, icon: Icon, route, style, badge }) => (
            <button
              key={label}
              onClick={() => router.push(route)}
              className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all ${style}`}
            >
              {badge && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                  {badge}
                </span>
              )}
              <Icon size={18} />
              <span className="text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}