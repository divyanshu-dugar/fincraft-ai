'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken } from '@/lib/authenticate';
import { getCurrency } from '@/lib/constants/currencies';

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches and manages the authenticated user's currency preferences.
 *
 * Returns:
 *  - currencies:       Array<{ code, symbol, name }> — user's configured currencies
 *  - defaultCurrency:  string                        — default currency code (e.g. 'USD')
 *  - defaultCurrencyObj: { code, symbol, name }      — full object for the default
 *  - loading:          boolean
 *  - saving:           boolean
 *  - addCurrency(currency):        adds to list (no-op if already exists)
 *  - removeCurrency(code):         removes from list (can't remove default)
 *  - setDefaultCurrency(code):     sets the default (must exist in list)
 *  - refetch():                    re-fetches from server
 */
export function useCurrencyPrefs() {
  const [currencies, setCurrencies] = useState([{ code: 'USD', symbol: '$', name: 'US Dollar' }]);
  const [defaultCurrency, setDefaultCurrencyState] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrefs = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/v1/profile`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.currencies?.length) setCurrencies(data.currencies);
      if (data.defaultCurrency) setDefaultCurrencyState(data.defaultCurrency);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrefs(); }, [fetchPrefs]);

  // Persist to server
  async function persist(newCurrencies, newDefault) {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const body = {};
      if (newCurrencies) body.currencies = newCurrencies;
      if (newDefault)    body.defaultCurrency = newDefault;

      const res = await fetch(`${API}/api/v1/profile/currencies`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `jwt ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setCurrencies(data.currencies);
      setDefaultCurrencyState(data.defaultCurrency);
    } catch { /* silent — optimistic already applied */ } finally {
      setSaving(false);
    }
  }

  function addCurrency(currency) {
    // { code, symbol, name }
    if (currencies.some((c) => c.code === currency.code)) return;
    const next = [...currencies, { code: currency.code, symbol: currency.symbol, name: currency.name }];
    setCurrencies(next); // optimistic
    persist(next, null);
  }

  function removeCurrency(code) {
    if (code === defaultCurrency) return; // can't remove default
    const next = currencies.filter((c) => c.code !== code);
    if (next.length === 0) return; // must keep at least one
    setCurrencies(next); // optimistic
    persist(next, null);
  }

  function setDefaultCurrency(code) {
    if (!currencies.some((c) => c.code === code)) return;
    setDefaultCurrencyState(code); // optimistic
    persist(currencies, code);
  }

  const defaultCurrencyObj = getCurrency(defaultCurrency);

  return {
    currencies,
    defaultCurrency,
    defaultCurrencyObj,
    loading,
    saving,
    addCurrency,
    removeCurrency,
    setDefaultCurrency,
    refetch: fetchPrefs,
  };
}
