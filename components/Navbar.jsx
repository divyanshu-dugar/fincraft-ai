'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, readToken, removeToken } from '@/lib/authenticate';
import {
  Menu, X, ChevronDown, ChevronRight, LogOut, BarChart3, User, Sparkles,
  LayoutDashboard, Home, TrendingUp, TrendingDown, List, Tag,
} from 'lucide-react';
import BudgetAlertsBell from '@/components/BudgetAlertsBell';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null);
  const [mobileActiveSubmenu, setMobileActiveSubmenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const hoverTimeout = useRef(null);
  const mobileMenuRef = useRef(null);
  const navRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const authenticated = isAuthenticated();
  const user = readToken();

  // Scroll-aware navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside (exclude both the panel and the nav/hamburger)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const outsidePanel = mobileMenuRef.current && !mobileMenuRef.current.contains(event.target);
      const outsideNav = navRef.current && !navRef.current.contains(event.target);
      if (outsidePanel && outsideNav) {
        setMobileMenuOpen(false);
        setMobileActiveDropdown(null);
        setMobileActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileActiveDropdown(null);
    setMobileActiveSubmenu(null);
  }, [pathname]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); };
  }, []);

  const handleLogout = () => {
    removeToken();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    router.replace('/');
    router.refresh();
  };

  // Hover handlers with a small delay to bridge the button→dropdown gap
  const handleMenuEnter = (menuName) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setActiveDropdown(menuName);
  };

  const handleMenuLeave = () => {
    hoverTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const toggleMobileDropdown = (menuName) => {
    setMobileActiveDropdown(mobileActiveDropdown === menuName ? null : menuName);
    setMobileActiveSubmenu(null);
  };

  const toggleMobileSubmenu = (title) => {
    setMobileActiveSubmenu(mobileActiveSubmenu === title ? null : title);
  };

  const isLinkActive = (href) => pathname === href;

  // Authenticated menu items with icons
  const authenticatedMenuItems = [
    {
      name: 'Ledgerify',
      items: [
        { name: 'Manage Income',        href: '/income/list',     icon: TrendingUp },
        { name: 'Manage Expenses',      href: '/expense/list',    icon: TrendingDown },
        { name: 'Income Categories',    href: '/income/category',  icon: Tag },
        { name: 'Expense Categories',   href: '/expense/category', icon: Tag },
      ],
    },
    {
      name: 'Budgetify',
      items: [
        { name: 'Budget List', href: '/budget/list', icon: List },
        { name: 'Add Budget', href: '/budget/add', icon: List },
        { name: 'Analytics', href: '/budget/analytics', icon: List },
      ],
    },
    {
      name: 'Goalify',
      items: [
        { name: 'Savings Goal List', href: '/goal/list', icon: List },
      ],
    },
  ];

  const menuItems = authenticated ? authenticatedMenuItems : [];

  const isHome = pathname === '/';
  const solidNav = !isHome || scrolled;

  return (
    <>
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solidNav
          ? 'bg-gradient-to-br from-slate-50 dark:from-slate-950/95 via-slate-50/95 dark:via-slate-900/95 to-slate-50 dark:to-slate-950/95 border-b border-cyan-400/10 backdrop-blur-xl shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Background gradient orb — only when solid */}
      {solidNav && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 right-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <BarChart3 className="w-5 h-5 text-slate-900 dark:text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Fincraft AI
              </span>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                  pathname === '/'
                    ? 'text-cyan-300 border border-cyan-400/50 bg-cyan-400/10'
                    : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30 border border-transparent'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </motion.button>
            </Link>

            {authenticated && (
              <Link href="/chat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                    pathname === '/chat'
                      ? 'text-emerald-300 border border-emerald-400/50 bg-emerald-400/10'
                      : 'text-slate-700 dark:text-slate-300 hover:text-emerald-300 hover:border-emerald-400/30 border border-transparent'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Chat
                </motion.button>
              </Link>
            )}

            {menuItems.map((menu) => (
              <div
                key={menu.name}
                className="relative"
                onMouseEnter={() => handleMenuEnter(menu.name)}
                onMouseLeave={handleMenuLeave}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === menu.name}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setActiveDropdown(null);
                    if (e.key === 'Enter' || e.key === ' ') handleMenuEnter(menu.name);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-all cursor-pointer border ${
                    activeDropdown === menu.name
                      ? 'text-cyan-300 border-cyan-400/50 bg-cyan-400/10'
                      : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 border-transparent hover:border-cyan-400/30'
                  }`}
                >
                  <span>{menu.name}</span>
                  <motion.div animate={{ rotate: activeDropdown === menu.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {activeDropdown === menu.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      onMouseEnter={() => handleMenuEnter(menu.name)}
                      onMouseLeave={handleMenuLeave}
                      className={`absolute left-0 top-full mt-2 ${menu.isMegaMenu ? 'w-[26rem]' : 'w-52'} bg-gradient-to-br from-slate-100/95 dark:from-slate-800/95 to-white/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-400/20 overflow-hidden`}
                    >
                      {menu.isMegaMenu ? (
                        /* Mega-menu: both groups side by side — no nested accordion needed */
                        <div className="flex divide-x divide-cyan-400/10">
                          {menu.items.map((group) => (
                            <div key={group.title} className="flex-1 p-3">
                              <div className="flex items-center gap-1.5 px-2 pb-2 mb-1 border-b border-cyan-400/10">
                                {group.icon && <group.icon className="w-3.5 h-3.5 text-cyan-400" />}
                                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">{group.title}</span>
                              </div>
                              {group.items.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  role="menuitem"
                                  className={`flex items-center gap-2 px-2 py-2 text-sm rounded-lg transition-all ${
                                    isLinkActive(sub.href)
                                      ? 'text-cyan-300 bg-cyan-400/15 font-medium'
                                      : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10'
                                  }`}
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {sub.icon && <sub.icon className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />}
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        menu.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            role="menuitem"
                            className={`flex items-center gap-2 px-4 py-3 text-sm transition-all border-b border-cyan-400/10 last:border-0 ${
                              isLinkActive(item.href)
                                ? 'text-cyan-300 bg-cyan-400/15 font-medium'
                                : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.icon && <item.icon className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />}
                            {item.name}
                          </Link>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Budget Alerts Bell */}
            {authenticated && <BudgetAlertsBell />}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons */}
            {authenticated ? (
              <div
                className="relative"
                onMouseEnter={() => handleMenuEnter('user')}
                onMouseLeave={handleMenuLeave}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'user'}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setActiveDropdown(null);
                    if (e.key === 'Enter' || e.key === ' ') handleMenuEnter('user');
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all border ${
                    activeDropdown === 'user'
                      ? 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10'
                      : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 border-transparent hover:border-cyan-400/30'
                  }`}
                >
                  <span className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-300 font-bold text-sm">
                    {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span>Account</span>
                  <motion.div animate={{ rotate: activeDropdown === 'user' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      onMouseEnter={() => handleMenuEnter('user')}
                      onMouseLeave={handleMenuLeave}
                      className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-slate-100/95 dark:from-slate-800/95 to-white/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-400/20 overflow-hidden"
                    >
                      <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-b border-cyan-400/10">
                        Signed in as <span className="text-cyan-300 font-bold">{user?.userName}</span>
                      </div>
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        className={`flex items-center gap-2 px-4 py-3 text-sm border-b border-cyan-400/10 transition-all ${
                          isLinkActive('/dashboard')
                            ? 'text-cyan-300 bg-cyan-400/15 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10'
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        role="menuitem"
                        className={`flex items-center gap-2 px-4 py-3 text-sm border-b border-cyan-400/10 transition-all ${
                          isLinkActive('/profile')
                            ? 'text-cyan-300 bg-cyan-400/15 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10'
                        }`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-lg transition-all font-medium ${
                      pathname === '/login'
                        ? 'text-cyan-300 border border-cyan-400/50 bg-cyan-400/10'
                        : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30 border border-transparent'
                    }`}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 rounded-lg font-medium transition-all"
                  >
                    Register
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-slate-700 dark:text-slate-300 hover:text-cyan-300 p-2 rounded-lg border border-transparent hover:border-cyan-400/30 transition-all"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <motion.div
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </nav>

      {/* Mobile Menu — rendered outside <nav> to avoid backdrop-filter containing-block issue */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-16 bottom-0 right-0 w-full max-w-sm bg-gradient-to-b from-white dark:from-slate-900 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 shadow-2xl z-50 overflow-y-auto border-l border-cyan-400/10"
            >
              <div className="p-4 space-y-3">
                {/* Home Link */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                      pathname === '/'
                        ? 'text-cyan-300 bg-cyan-400/10 border border-cyan-400/50'
                        : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/20'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                </motion.div>

                {/* AI Chat Link */}
                {authenticated && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        pathname === '/chat'
                          ? 'text-emerald-300 bg-emerald-400/10 border border-emerald-400/50'
                          : 'text-slate-700 dark:text-slate-300 hover:text-emerald-300 hover:bg-emerald-400/10 border border-emerald-400/20'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Chat
                    </Link>
                  </motion.div>
                )}

                {/* Menu Items */}
                {menuItems.map((menu, idx) => (
                  <motion.div
                    key={menu.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <button
                      onClick={() => toggleMobileDropdown(menu.name)}
                      aria-expanded={mobileActiveDropdown === menu.name}
                      className="w-full flex justify-between items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/20 transition-all font-medium"
                    >
                      <span>{menu.name}</span>
                      <motion.div
                        animate={{ rotate: mobileActiveDropdown === menu.name ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {mobileActiveDropdown === menu.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 mt-2 space-y-1">
                            {menu.isMegaMenu ? (
                              menu.items.map((group) => (
                                <div key={group.title}>
                                  <button
                                    onClick={() => toggleMobileSubmenu(group.title)}
                                    aria-expanded={mobileActiveSubmenu === group.title}
                                    className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all border border-transparent hover:border-cyan-400/30"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {group.icon && <group.icon className="w-3.5 h-3.5 text-cyan-400" />}
                                      <span className="font-medium">{group.title}</span>
                                    </div>
                                    <motion.div
                                      animate={{ rotate: mobileActiveSubmenu === group.title ? 90 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </motion.div>
                                  </button>

                                  <AnimatePresence>
                                    {mobileActiveSubmenu === group.title && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="pl-4 mt-1 space-y-1">
                                          {group.items.map((sub) => (
                                            <Link
                                              key={sub.name}
                                              href={sub.href}
                                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                                                isLinkActive(sub.href)
                                                  ? 'text-cyan-300 bg-cyan-400/15 font-medium'
                                                  : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10'
                                              }`}
                                              onClick={() => setMobileMenuOpen(false)}
                                            >
                                              {sub.icon && <sub.icon className="w-3.5 h-3.5 opacity-60" />}
                                              {sub.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))
                            ) : (
                              menu.items.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                                    isLinkActive(item.href)
                                      ? 'text-cyan-300 bg-cyan-400/15 font-medium'
                                      : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10'
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.icon && <item.icon className="w-3.5 h-3.5 opacity-60" />}
                                  {item.name}
                                </Link>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Mobile Auth Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (menuItems.length + 1) * 0.05 }}
                  className="mt-6 pt-6 border-t border-cyan-400/10 space-y-3"
                >
                  {authenticated ? (
                    <>
                      <div className="px-4 py-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl">
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Signed in as</p>
                        <p className="font-bold text-cyan-300">{user?.userName}</p>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-xl font-medium transition-all ${
                            isLinkActive('/dashboard')
                              ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/70'
                              : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border-cyan-400/50'
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-xl font-medium transition-all ${
                            isLinkActive('/profile')
                              ? 'bg-cyan-400/15 text-cyan-300 border-cyan-400/40'
                              : 'bg-slate-100/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border-white/10'
                          }`}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-400/30 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all border ${
                            pathname === '/login'
                              ? 'text-cyan-300 bg-cyan-400/10 border-cyan-400/50'
                              : 'text-slate-700 dark:text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border-cyan-400/20'
                          }`}
                        >
                          Login
                        </Link>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 rounded-xl font-medium transition-all"
                        >
                          Register
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}