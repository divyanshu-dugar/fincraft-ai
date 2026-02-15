'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, readToken, removeToken } from '@/lib/authenticate';
import { Menu, X, ChevronDown, ChevronRight, LogOut, BarChart3 } from 'lucide-react';

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null);
  const [mobileActiveSubmenu, setMobileActiveSubmenu] = useState(null);
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const authenticated = isAuthenticated();
  const user = readToken();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setActiveSubmenu(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
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

  const handleLogout = () => {
    removeToken();
    setActiveDropdown(null);
    setActiveSubmenu(null);
    setMobileMenuOpen(false);
    router.replace('/');
    router.refresh();
  };

  const toggleDropdown = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
    setActiveSubmenu(null);
  };

  const toggleSubmenu = (title) => {
    setActiveSubmenu(activeSubmenu === title ? null : title);
  };

  const toggleMobileDropdown = (menuName) => {
    setMobileActiveDropdown(mobileActiveDropdown === menuName ? null : menuName);
    setMobileActiveSubmenu(null);
  };

  const toggleMobileSubmenu = (title) => {
    setMobileActiveSubmenu(mobileActiveSubmenu === title ? null : title);
  };

  // Authenticated menu items
  const authenticatedMenuItems = [
    {
      name: 'Ledgerify',
      items: [
        {
          title: 'Income Tracker',
          items: [
            { name: 'Income List', href: '/income/list' },
            { name: 'Add Income', href: '/income/add' },
            { name: 'Add Category', href: '/income/category' },
          ],
        },
        {
          title: 'Expenses Tracker',
          items: [
            { name: 'Expense List', href: '/expense/list' },
            { name: 'Add Expense', href: '/expense/add' },
            { name: 'Add Category', href: '/expense/category' },
          ],
        },
      ],
    },
    {
      name: 'Budgetify',
      items: [
        { name: 'Budget List', href: '/budget/list' },
        { name: 'Add Budget', href: '/budget/add' },
      ],
    },
    {
      name: 'Goalify',
      items: [
        { name: 'Savings Goal List', href: '/goal/list' },
      ],
    },
  ];

  // const publicMenuItems = [
  //   {
  //     name: 'Tools',
  //     items: [
  //       { name: 'Tax Calculator', href: '/tax-calculator' },
  //       { name: 'Currency Converter', href: '/currency-converter' },
  //     ],
  //   },
  // ];

  const menuItems = authenticated ? authenticatedMenuItems : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-cyan-400/10 backdrop-blur-xl" ref={dropdownRef}>
      {/* Background gradient orb */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <BarChart3 className="w-5 h-5 text-white" />
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
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  pathname === '/'
                    ? 'text-cyan-300 border border-cyan-400/50 bg-cyan-400/10'
                    : 'text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30 border border-transparent'
                }`}
              >
                Home
              </motion.button>
            </Link>

            {menuItems.map((menu) => (
              <div key={menu.name} className="relative group">
                <motion.button
                  onClick={() => toggleDropdown(menu.name)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-slate-300 hover:text-cyan-300 rounded-lg flex items-center space-x-1 transition-all cursor-pointer border border-transparent hover:border-cyan-400/30"
                >
                  <span>{menu.name}</span>
                  <motion.div animate={{ rotate: activeDropdown === menu.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === menu.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-2 w-56 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-400/20 overflow-hidden"
                    >
                      {menu.items[0]?.items ? (
                        menu.items.map((group) => (
                          <div key={group.title} className="border-b border-cyan-400/10 last:border-0">
                            <button
                              onClick={() => toggleSubmenu(group.title)}
                              className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-400/10 transition-all"
                            >
                              <span>{group.title}</span>
                              <motion.div animate={{ rotate: activeSubmenu === group.title ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-3 h-3" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {activeSubmenu === group.title && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  {group.items.map((sub) => (
                                    <Link
                                      key={sub.name}
                                      href={sub.href}
                                      className="block px-6 py-2 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all"
                                      onClick={() => {
                                        setActiveDropdown(null);
                                        setActiveSubmenu(null);
                                      }}
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
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
                            className="block px-4 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all border-b border-cyan-400/10 last:border-0"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.name}
                          </Link>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Auth Buttons */}
            {authenticated ? (
              <div className="relative">
                <motion.button
                  onClick={() => toggleDropdown('user')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-slate-300 hover:text-cyan-300 rounded-lg flex items-center space-x-2 border border-transparent hover:border-cyan-400/30 transition-all"
                >
                  <span className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-300 font-bold text-sm">
                    {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span>Account</span>
                </motion.button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-400/20 overflow-hidden"
                    >
                      <div className="px-4 py-3 text-sm text-slate-400 border-b border-cyan-400/10">
                        Signed in as <span className="text-cyan-300 font-bold">{user?.userName}</span>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border-b border-cyan-400/10 transition-all"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Dashboard
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </motion.button>
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
                        : 'text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30 border border-transparent'
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
            className="md:hidden text-slate-300 hover:text-cyan-300 p-2 rounded-lg border border-transparent hover:border-cyan-400/30 transition-all"
            aria-label="Toggle menu"
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

      {/* Mobile Menu */}
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
              className="md:hidden fixed inset-y-16 right-0 w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl z-50 overflow-y-auto border-l border-cyan-400/10"
            >
              <div className="p-4 space-y-3">
                {/* Home Link */}
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                      pathname === '/'
                        ? 'text-cyan-300 bg-cyan-400/10 border border-cyan-400/50'
                        : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/20'
                    }`}
                  >
                    Home
                  </motion.button>
                </Link>

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
                      className="w-full flex justify-between items-center px-4 py-3 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/20 transition-all font-medium"
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
                          <div className="pl-6 mt-2 space-y-2">
                            {menu.items[0]?.items ? (
                              menu.items.map((group) => (
                                <div key={group.title}>
                                  <button
                                    onClick={() => toggleMobileSubmenu(group.title)}
                                    className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all border border-transparent hover:border-cyan-400/30"
                                  >
                                    <span className="font-medium">{group.title}</span>
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
                                        <div className="pl-4 mt-2 space-y-1">
                                          {group.items.map((sub) => (
                                            <Link
                                              key={sub.name}
                                              href={sub.href}
                                              className="block px-3 py-2 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-all"
                                              onClick={() => setMobileMenuOpen(false)}
                                            >
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
                                  className="block px-3 py-2 text-sm text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-all"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
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
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Signed in as</p>
                        <p className="font-bold text-cyan-300">{user?.userName}</p>
                      </div>

                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-3 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl font-medium transition-all"
                        >
                          Dashboard
                        </motion.button>
                      </Link>

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
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full px-4 py-3 rounded-xl font-medium transition-all border ${
                            pathname === '/login'
                              ? 'text-cyan-300 bg-cyan-400/10 border-cyan-400/50'
                              : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/10 border-cyan-400/20'
                          }`}
                        >
                          Login
                        </motion.button>
                      </Link>

                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 rounded-xl font-medium transition-all"
                        >
                          Register
                        </motion.button>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}