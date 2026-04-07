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

export async function authenticateUser(user, password) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ userName: user, password: password }),
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
    throw new Error(data.message);
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