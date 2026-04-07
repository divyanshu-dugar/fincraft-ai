'use client';

/**
 * @file BudgetAlertsBell.jsx
 * @description
 * Navbar bell icon that polls budget alerts from the API and shows them
 * in a dropdown. Purely in-app — no push/email notifications.
 *
 * Flow:
 *  1. On mount, call GET /budgets/check-alerts → backend writes new alerts to DB
 *  2. Then fetch GET /budgets/alerts → render them
 *  3. Clicking an alert marks it read via PUT /budgets/alerts/:id/read
 *  4. Re-polls every 5 minutes while the tab is open
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, X, AlertTriangle, TrendingUp, CheckCircle2, Check, Trash2 } from 'lucide-react';
import { getToken } from '@/lib/authenticate';

const API    = process.env.NEXT_PUBLIC_API_URL;
const SCHEME = 'jwt';
const POLL_MS = 5 * 60 * 1000; // 5 min

function authHeaders() {
  return { Authorization: `${SCHEME} ${getToken()}`, 'Content-Type': 'application/json' };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function alertMeta(type) {
  switch (type) {
    case 'budget_exceeded':
      return { Icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-500/15',   border: 'border-red-500/30',   label: 'Exceeded'  };
    case 'budget_almost_exceeded':
      return { Icon: TrendingUp,    color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', label: 'Warning'   };
    default:
      return { Icon: Bell,          color: 'text-blue-400',  bg: 'bg-blue-500/15',  border: 'border-blue-500/30',  label: 'Alert'     };
  }
}

export default function BudgetAlertsBell() {
  const [alerts,  setAlerts]  = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/budgets/alerts`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }, []);

  const checkAndFetch = useCallback(async () => {
    setLoading(true);
    try {
      // Trigger backend check — creates new alerts if thresholds crossed
      await fetch(`${API}/budgets/check-alerts`, { headers: authHeaders() });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
    await fetchAlerts();
  }, [fetchAlerts]);

  // Mount + poll
  useEffect(() => {
    checkAndFetch();
    const timer = setInterval(checkAndFetch, POLL_MS);
    // Re-check immediately whenever a new expense is saved anywhere in the app
    window.addEventListener('expense-added', checkAndFetch);
    return () => {
      clearInterval(timer);
      window.removeEventListener('expense-added', checkAndFetch);
    };
  }, [checkAndFetch]);

  const markRead = async (id) => {
    try {
      await fetch(`${API}/budgets/alerts/${id}/read`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, isRead: true } : a));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    const unread = alerts.filter((a) => !a.isRead);
    await Promise.all(unread.map((a) => markRead(a._id)));
  };

  const clearAlerts = async (all = false) => {
    try {
      const url = `${API}/budgets/alerts${all ? '?all=1' : ''}`;
      await fetch(url, { method: 'DELETE', headers: authHeaders() });
      if (all) {
        setAlerts([]);
      } else {
        setAlerts((prev) => prev.filter((a) => !a.isRead));
      }
    } catch { /* silent */ }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const hasUnread   = unreadCount > 0;

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`relative p-2 rounded-lg border transition-all duration-200 ${
          open
            ? 'text-amber-300 border-amber-400/50 bg-amber-400/10'
            : 'text-slate-400 border-transparent hover:text-amber-300 hover:border-amber-400/30 hover:bg-amber-400/10'
        }`}
        aria-label={`Budget alerts${hasUnread ? ` (${unreadCount} unread)` : ''}`}
      >
        {hasUnread ? (
          <motion.div
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
          >
            <BellRing className="w-5 h-5" />
          </motion.div>
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {/* Unread badge */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black leading-none shadow-lg shadow-red-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-slate-800/98 to-slate-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-400/20 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Budget Alerts</span>
                {hasUnread && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasUnread && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded-lg hover:bg-cyan-400/10"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-700/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Alert list */}
            <div className="max-h-[380px] overflow-y-auto">
              {loading && alerts.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-slate-500 text-sm">
                  Checking budgets…
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
                  <p className="text-slate-400 text-sm font-medium">All budgets on track</p>
                  <p className="text-slate-600 text-xs">No alerts yet</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const { Icon, color, bg, border, label } = alertMeta(alert.type);
                  return (
                    <div
                      key={alert._id}
                      className={`relative flex gap-3 px-4 py-3 border-b border-slate-700/40 last:border-0 transition-colors ${
                        alert.isRead ? 'opacity-50' : 'bg-slate-800/40'
                      }`}
                    >
                      {/* Type icon */}
                      <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg ${bg} border ${border} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
                          <span className="text-[10px] text-slate-600">·</span>
                          <span className="text-[10px] text-slate-500">{timeAgo(alert.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{alert.message}</p>

                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              alert.percentage > 100 ? 'bg-red-500' :
                              alert.percentage >= 80  ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {alert.percentage.toFixed(0)}% used · ${alert.currentSpent?.toFixed(2)} of ${alert.budgetAmount?.toFixed(2)}
                        </p>
                      </div>

                      {/* Mark read */}
                      {!alert.isRead && (
                        <button
                          onClick={() => markRead(alert._id)}
                          className="shrink-0 mt-0.5 p-1 text-slate-600 hover:text-emerald-400 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-700/40 flex items-center justify-between gap-2">
                <button
                  onClick={checkAndFetch}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  Refresh
                </button>
                <div className="flex items-center gap-2">
                  {alerts.some((a) => a.isRead) && (
                    <button
                      onClick={() => clearAlerts(false)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors px-2 py-1 rounded-lg hover:bg-amber-400/10"
                      title="Delete read alerts from database"
                    >
                      <Trash2 className="w-3 h-3" /> Clear read
                    </button>
                  )}
                  <button
                    onClick={() => clearAlerts(true)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 transition-colors px-2 py-1 rounded-lg hover:bg-rose-400/10"
                    title="Delete all alerts from database"
                  >
                    <Trash2 className="w-3 h-3" /> Clear all
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
