'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/authenticate';
import Navbar from '@/components/Navbar';
import AppSidebar from '@/components/AppSidebar';
import { SidebarContext } from '@/components/AppSidebar';

// Public routes that should use the Navbar instead of the sidebar
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/tax-calculator',
  '/currency-converter',
];

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const authenticated = isAuthenticated();
  const isPublic = isPublicRoute(pathname);
  const [collapsed, setCollapsed] = useState(false);

  // Public pages or unauthenticated: use the classic Navbar
  if (isPublic || !authenticated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  // Authenticated pages: use the Sidebar layout
  // Context wraps BOTH sidebar and main so they share collapsed state
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <AppSidebar />
      <main
        className={`min-h-screen transition-all duration-300 pt-14 lg:pt-0 ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {children}
      </main>
    </SidebarContext.Provider>
  );
}
