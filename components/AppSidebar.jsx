'use client';

import Link from 'next/link';
import { useState, useEffect, useContext, createContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { readToken, removeToken } from '@/lib/authenticate';
import BudgetAlertsBell from '@/components/BudgetAlertsBell';
import {
  BarChart3, ChevronDown, ChevronLeft, ChevronRight, LogOut,
  LayoutDashboard, Sparkles, TrendingUp, TrendingDown, Tag, List,
  PieChart, Target, User, Menu, X, Plus, CalendarClock,
} from 'lucide-react';

// ─── Sidebar context (shared with AppShell for padding) ──────────────────────
const SidebarContext = createContext({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);
export { SidebarContext };

// ─── Navigation structure ────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    title: null, // top-level links (no group header)
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'AI Chat', href: '/chat', icon: Sparkles },
    ],
  },
  {
    title: 'Ledgerify',
    items: [
      { name: 'Expenses', href: '/expense/list', icon: TrendingDown },
      { name: 'Income', href: '/income/list', icon: TrendingUp },
      { name: 'Expense Categories', href: '/expense/category', icon: Tag },
      { name: 'Income Categories', href: '/income/category', icon: Tag },
      { name: 'Recurring Expenses', href: '/expense/recurring', icon: CalendarClock },
      { name: 'Recurring Income', href: '/income/recurring', icon: CalendarClock },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Expense Analytics', href: '/expense/analytics', icon: PieChart },
      { name: 'Income Analytics', href: '/income/analytics', icon: PieChart },
      { name: 'Budget Analytics', href: '/budget/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Budgetify',
    items: [
      { name: 'Budgets', href: '/budget/list', icon: List },
      { name: 'Add Budget', href: '/budget/add', icon: Plus },
    ],
  },
  {
    title: 'Goalify',
    items: [
      { name: 'Savings Goals', href: '/goal/list', icon: Target },
    ],
  },
];

// ─── Sidebar component ──────────────────────────────────────────────────────
export default function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const pathname = usePathname();
  const router = useRouter();
  const user = readToken();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Auto-expand the section containing the active link
  useEffect(() => {
    for (const section of NAV_SECTIONS) {
      if (section.title && section.items.some((item) => pathname.startsWith(item.href.split('?')[0]))) {
        setExpandedSections((prev) => ({ ...prev, [section.title]: true }));
      }
    }
  }, [pathname]);

  const toggleSection = (title) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/chat') return pathname === '/chat';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    removeToken();
    setMobileOpen(false);
    router.replace('/');
    router.refresh();
  };

  // ── Sidebar content (shared between desktop & mobile) ────────────────────
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className={`flex border-b border-slate-700/50 flex-shrink-0 ${collapsed ? 'flex-col items-center py-3 gap-2' : 'items-center h-16 px-4 gap-3'}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-cyan-500/40 transition-all">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent truncate">
              Fincraft AI
            </span>
          )}
        </Link>
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all flex-shrink-0 ${collapsed ? '' : 'ml-auto'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
        {NAV_SECTIONS.map((section, si) => {
          const isExpanded = section.title ? (expandedSections[section.title] ?? true) : true;

          return (
            <div key={si} className={section.title ? 'mt-4 first:mt-0' : ''}>
              {/* Section header */}
              {section.title && (
                <button
                  onClick={() => !collapsed && toggleSection(section.title)}
                  className={`w-full flex items-center gap-2 mb-1 rounded-lg transition-all ${
                    collapsed
                      ? 'justify-center px-1 py-2'
                      : 'px-2.5 py-1.5 hover:bg-slate-700/30'
                  }`}
                >
                  {collapsed ? (
                    <div className="w-5 h-px bg-slate-700 rounded" />
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex-1 text-left">
                        {section.title}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              )}

              {/* Items */}
              <AnimatePresence initial={false}>
                {(isExpanded || collapsed) && (
                  <motion.div
                    initial={section.title ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group/nav relative flex items-center gap-3 rounded-xl transition-all duration-150 ${
                            collapsed ? 'justify-center p-2.5' : 'px-3 py-2'
                          } ${
                            active
                              ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-400/20 shadow-sm shadow-cyan-500/5'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border border-transparent'
                          }`}
                        >
                          <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                            active ? 'text-cyan-400' : 'text-slate-500 group-hover/nav:text-slate-300'
                          }`} />
                          {!collapsed && (
                            <span className={`text-sm truncate ${active ? 'font-semibold' : 'font-medium'}`}>
                              {item.name}
                            </span>
                          )}
                          {active && !collapsed && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                          )}
                          {/* Styled tooltip — visible only when collapsed */}
                          {collapsed && (
                            <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 whitespace-nowrap opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-50 shadow-lg shadow-black/30">
                              {item.name}
                              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── Bottom section: alerts, user, logout ─────────────────────────── */}
      <div className={`border-t border-slate-700/50 p-3 space-y-1 flex-shrink-0 ${collapsed ? 'items-center' : ''}`}>
        {/* Budget alerts */}
        <div className={`flex ${collapsed ? 'justify-center' : 'px-1'}`}>
          <BudgetAlertsBell />
        </div>

        {/* Profile link */}
        <Link
          href="/profile"
          className={`group/nav relative flex items-center gap-3 rounded-xl transition-all duration-150 ${
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
          } ${
            pathname === '/profile'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border border-transparent'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-xs flex-shrink-0">
            {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.userName || 'User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          )}
          {collapsed && (
            <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 whitespace-nowrap opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-50 shadow-lg shadow-black/30">
              {user?.userName || 'Profile'}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`group/nav relative w-full flex items-center gap-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 border border-transparent hover:border-rose-500/20 ${
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2'
          }`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
          {collapsed && (
            <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 whitespace-nowrap opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-50 shadow-lg shadow-black/30">
              Logout
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-slate-950/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Fincraft AI
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50 shadow-2xl shadow-black/40"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50 transition-all duration-300 ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
