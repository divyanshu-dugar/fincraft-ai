'use client';

import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { socialLogin } from '@/lib/authenticate';

export default function SocialAuthButtons({ accentClass = 'cyan' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loadingProvider, setLoadingProvider] = useState(null);

  // ── Google ──────────────────────────────────────────────────────────────
  const handleGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: () => {},
    onError: () => setError('Google sign-in was cancelled or failed.'),
  });

  const onGoogleCredential = async (credential) => {
    setLoadingProvider('google');
    setError('');
    try {
      await socialLogin('google', { credential });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProvider(null);
    }
  };

  // Register a global One Tap callback so Google can call us back
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__fincraftGoogleCallback = (response) => {
      onGoogleCredential(response.credential);
    };
    return () => { delete window.__fincraftGoogleCallback; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google?.accounts) return;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: window.__fincraftGoogleCallback,
      auto_select: false,
    });
  }, []);

  const handleGoogleClick = async () => {
    setError('');
    setLoadingProvider('google');
    try {
      await new Promise((resolve, reject) => {
        if (!window.google?.accounts?.id) {
          reject(new Error('Google SDK not ready'));
          return;
        }
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await socialLogin('google', { credential: response.credential });
              router.push('/dashboard');
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          auto_select: false,
        });
        window.google.accounts.id.prompt((n) => {
          if (n.isNotDisplayed() || n.isSkippedMoment()) {
            reject(new Error('Google sign-in was dismissed. Try again.'));
          }
        });
      });
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const border = accentClass === 'emerald'
    ? 'border-emerald-400/30 hover:border-emerald-400/60'
    : 'border-cyan-400/30 hover:border-cyan-400/60';

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-slate-700" />
        <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">or continue with</span>
        <div className="flex-1 border-t border-slate-700" />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-rose-400 text-center font-medium">{error}</p>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={!!loadingProvider}
        className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800/70 border ${border} text-white text-sm font-bold hover:bg-slate-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loadingProvider === 'google' ? (
          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        Continue with Google
      </button>
    </div>
  );
}
