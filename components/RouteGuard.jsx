'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, isTokenExpired, refreshAccessToken } from '../lib/authenticate';

const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // Refresh JWT every 10 minutes

const RouteGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const refreshInterval = useRef(null);

  // Proactive background refresh — keeps the JWT valid so API calls never fail
  useEffect(() => {
    const publicPaths = ['/login', '/register', '/', '/tax-calculator', '/currency-converter', '/forgot-password', '/reset-password'];
    if (publicPaths.includes(pathname)) {
      clearInterval(refreshInterval.current);
      return;
    }

    const silentRefresh = async () => {
      if (isTokenExpired()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          clearInterval(refreshInterval.current);
          setAuthorized(false);
          router.push('/login');
        }
      }
    };

    refreshInterval.current = setInterval(silentRefresh, TOKEN_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval.current);
  }, [pathname, router]);

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/', '/tax-calculator', '/currency-converter', '/forgot-password', '/reset-password'];

    // If on a public route
    if (publicPaths.includes(pathname)) {
      setAuthorized(true);
      return;
    }

    // If not authenticated at all, redirect
    if (!isAuthenticated()) {
      setAuthorized(false);
      router.push('/login');
      return;
    }

    // If the access token is expired, try to silently refresh before deciding
    if (isTokenExpired()) {
      refreshAccessToken().then((refreshed) => {
        if (refreshed) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          router.push('/login');
        }
      });
      return;
    }

    setAuthorized(true);
  }, [pathname, router]);

  // Render children only if authorized, otherwise show loader or nothing
  if (!authorized) return null;

  return children;
};

export default RouteGuard;
