import { jwtDecode } from 'jwt-decode';

export function setToken(token) {
  localStorage.setItem('access_token', token);
}

export function getToken() {
  try {
    return localStorage.getItem('access_token');
  } catch (err) {
    return null;
  }
}

export function removeToken() {
  localStorage.removeItem('access_token');
}

export function readToken() {
  try {
    const token = getToken();
    return token ? jwtDecode(token) : null;
  } catch (err) {
    return null;
  }
}

/** Returns true only if the access token exists and has not expired. */
export function isTokenExpired() {
  const decoded = readToken();
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds; subtract a 30-second buffer to refresh proactively
  return decoded.exp * 1000 < Date.now() + 30_000;
}

export function isAuthenticated() {
  const token = readToken();
  return token ? true : false;
}

/**
 * Attempts to get a new access token using the httpOnly refresh token cookie.
 * Returns true on success, false if the session has fully expired.
 */
export async function refreshAccessToken() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // sends the httpOnly refresh_token cookie
    });

    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      return true;
    }

    // Refresh token is invalid/expired — clear local state
    removeToken();
    return false;
  } catch {
    return false;
  }
}

/**
 * Returns a valid access token, refreshing automatically if the current one
 * is expired or about to expire. Returns null if the session cannot be renewed.
 */
export async function getValidToken() {
  if (isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
  }
  return getToken();
}

/**
 * Authenticated fetch wrapper. Automatically attaches a valid JWT, refreshes
 * on expiry, and retries once on 401. Drop-in replacement for fetch().
 */
let _refreshPromise = null;
export async function authFetch(url, options = {}) {
  const token = await getValidToken();
  if (!token) {
    removeToken();
    window.location.href = '/login';
    return new Response(null, { status: 401 });
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `jwt ${token}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    // Deduplicate concurrent refresh attempts
    if (!_refreshPromise) {
      _refreshPromise = refreshAccessToken().finally(() => { _refreshPromise = null; });
    }
    const refreshed = await _refreshPromise;
    if (!refreshed) {
      removeToken();
      window.location.href = '/login';
      return res;
    }
    const newToken = getToken();
    headers.set('Authorization', `jwt ${newToken}`);
    return fetch(url, { ...options, headers, credentials: 'include' });
  }

  return res;
}

export async function authenticateUser(user, password, rememberMe = false) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ userName: user, password: password, rememberMe }),
    credentials: 'include', // needed to receive the refresh_token cookie
    headers: {
      'content-type': 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 200) {
    setToken(data.token);
    return true;
  } else {
    const err = new Error(data.message);
    if (data.code) err.code = data.code;
    if (data.email) err.email = data.email;
    throw err;
  }
}

export async function logoutUser() {
  removeToken();
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Best-effort; local token already removed
  }
}

export async function registerUser(user, email, password, password2) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ userName: user, email: email, password: password, password2: password2 }),
    headers: {
      'content-type': 'application/json',
    },
  });

  const data = await res.json();

  if (res.status === 201) {
    return true;
  } else {
    throw new Error(data.message);
  }
}

/**
 * Exchange an OAuth ID token (Google credential or Apple idToken) for a
 * Fincraft JWT. On success stores the access token locally.
 *
 * @param {'google'|'apple'} provider
 * @param {object} params - { credential } for Google, { idToken, email?, name? } for Apple
 */
export async function socialLogin(provider, params) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/${provider}`, {
    method: 'POST',
    credentials: 'include', // receive refresh_token cookie
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (res.ok) {
    setToken(data.token);
    return true;
  } else {
    throw new Error(data.message || `${provider} sign-in failed`);
  }
}

export async function verifyEmail(token) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Verification failed');
  return data.message;
}

export async function resendVerificationEmail(email) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to resend');
  return data.message;
}