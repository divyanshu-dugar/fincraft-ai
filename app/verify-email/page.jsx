'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { verifyEmail } from '@/lib/authenticate';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please use the link from your email.');
      return;
    }

    verifyEmail(token)
      .then((msg) => {
        setMessage(msg);
        setStatus('success');
      })
      .catch((err) => {
        setMessage(err.message || 'Verification failed. The link may have expired.');
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-3xl opacity-10" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-slate-700/50" />
          <div className="relative p-10 text-center space-y-6">

            {/* Icon */}
            <motion.div
              animate={status === 'loading' ? { rotate: 360 } : { scale: [1, 1.1, 1] }}
              transition={
                status === 'loading'
                  ? { duration: 1.2, repeat: Infinity, ease: 'linear' }
                  : { duration: 2, repeat: Infinity }
              }
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mx-auto border ${
                status === 'loading'
                  ? 'bg-slate-800/60 border-slate-600/40'
                  : status === 'success'
                  ? 'bg-emerald-500/20 border-emerald-400/40'
                  : 'bg-red-500/20 border-red-400/40'
              }`}
            >
              {status === 'loading' && <Loader2 className="w-10 h-10 text-slate-400" />}
              {status === 'success' && <CheckCircle className="w-10 h-10 text-emerald-400" />}
              {status === 'error'   && <XCircle   className="w-10 h-10 text-red-400" />}
            </motion.div>

            {/* Heading */}
            <div>
              <h1 className="text-2xl font-black text-white mb-2">
                {status === 'loading' && 'Verifying your email…'}
                {status === 'success' && 'Email verified!'}
                {status === 'error'   && 'Verification failed'}
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            {status === 'success' && (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative py-3 px-4 rounded-xl font-bold text-lg text-white overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl" />
                  <span className="relative">Sign In to Fincraft AI</span>
                </motion.button>
              </Link>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl border border-cyan-400/50 text-cyan-300 font-bold hover:border-cyan-400/80 hover:bg-cyan-400/10 transition-all"
                  >
                    Back to Sign In
                  </motion.button>
                </Link>
                <p className="text-slate-500 text-xs">
                  You can request a new verification link from the sign-in page.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-6">
          <Lock className="w-3 h-3" />
          <span>Fincraft AI · Secure Financial Management</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
