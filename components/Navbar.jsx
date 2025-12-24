'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, readToken, removeToken } from '@/lib/authenticate';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

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
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg sticky top-0 z-50" ref={dropdownRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors">
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
              Fincraft AI
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition-all font-medium ${
                pathname === '/' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/20'
              }`}
            >
              Home
            </Link>

            {menuItems.map((menu) => (
              <div key={menu.name} className="relative">
                <button
                  onClick={() => toggleDropdown(menu.name)}
                  className="px-4 py-2 text-white hover:bg-white/20 rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <span>{menu.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${activeDropdown === menu.name ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-200 overflow-hidden ${
                    activeDropdown === menu.name
                      ? 'max-h-[500px] opacity-100 visible'
                      : 'max-h-0 opacity-0 invisible'
                  }`}
                >
                  {menu.items[0]?.items ? (
                    menu.items.map((group) => (
                      <div key={group.title} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => toggleSubmenu(group.title)}
                          className="w-full flex justify-between items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-blue-50 transition-all"
                        >
                          <span>{group.title}</span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              activeSubmenu === group.title ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <div
                          className={`transition-all duration-200 overflow-hidden ${
                            activeSubmenu === group.title
                              ? 'max-h-[300px] opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          {group.items.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="block px-6 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => {
                                setActiveDropdown(null);
                                setActiveSubmenu(null);
                              }}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    menu.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))}

            {/* Auth Buttons */}
            {authenticated ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="px-4 py-2 text-white hover:bg-white/20 rounded-lg flex items-center space-x-2"
                >
                  <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span>Account</span>
                </button>

                {activeDropdown === 'user' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                      Signed in as <strong>{user?.userName}</strong>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    pathname === '/login'
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-gray-200 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Mobile Menu Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-700 p-4 flex justify-between items-center">
            <span className="text-xl font-bold text-white">Fincraft AI</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white p-2"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="p-4">
            {/* Home Link */}
            <Link
              href="/"
              className={`block w-full px-4 py-3 rounded-lg mb-2 transition-all font-medium ${
                pathname === '/' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Menu Items */}
            {menuItems.map((menu) => (
              <div key={menu.name} className="mb-2">
                <button
                  onClick={() => toggleMobileDropdown(menu.name)}
                  className="w-full flex justify-between items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <span className="font-medium">{menu.name}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      mobileActiveDropdown === menu.name ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Mobile Dropdown Content */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    mobileActiveDropdown === menu.name ? 'max-h-[1000px]' : 'max-h-0'
                  }`}
                >
                  <div className="pl-6 mt-1 space-y-1">
                    {menu.items[0]?.items ? (
                      menu.items.map((group) => (
                        <div key={group.title} className="mb-2">
                          <button
                            onClick={() => toggleMobileSubmenu(group.title)}
                            className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                          >
                            <span className="font-medium">{group.title}</span>
                            <ChevronRight
                              className={`w-3 h-3 transition-transform ${
                                mobileActiveSubmenu === group.title ? 'rotate-90' : ''
                              }`}
                            />
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-200 ${
                              mobileActiveSubmenu === group.title ? 'max-h-[300px]' : 'max-h-0'
                            }`}
                          >
                            <div className="pl-4 mt-1 space-y-1">
                              {group.items.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      menu.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Auth Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {authenticated ? (
                <>
                  <div className="px-4 py-3 mb-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Signed in as</p>
                    <p className="font-medium text-gray-900">{user?.userName}</p>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="block w-full px-4 py-3 mb-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`block w-full px-4 py-3 mb-2 rounded-lg font-medium text-center ${
                      pathname === '/login'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}