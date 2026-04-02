'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '../lib/authenticate';

const RouteGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/', '/tax-calculator', '/currency-converter', '/forgot-password', '/reset-password'];

    // If on a public route
    if (publicPaths.includes(pathname)) {
      setAuthorized(true);
      return;
    }

    // If not authenticated, redirect
    if (!isAuthenticated()) {
      setAuthorized(false);
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  // Render children only if authorized, otherwise show loader or nothing
  if (!authorized) return null;

  return children;
};

export default RouteGuard;
