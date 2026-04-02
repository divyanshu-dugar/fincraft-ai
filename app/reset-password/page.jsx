'use client';

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ token, password }),
        headers: { 'content-type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const orbVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (index) => ({
      scale: 1,
      opacity: [0.2, 0.5, 0.2],
      y: [-20, 20, -20],
      transition: {
        scale: { duration: 0.6, delay: index * 0.1 },
        opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
      },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Invalid Reset Link</h1>
          <p className="text-slate-300">This password reset link is invalid or missing a token.</p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center pt-18 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          custom={0}
          variants={orbVariants}
          initial="initial"
          animate="animate"
          className="absolute -top-40 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          custom={1}
          variants={orbVariants}
          initial="initial"
          animate="animate"
          className="absolute -bottom-40 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl opacity-20"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 mb-6"
            >
              <Lock className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-2">
              Reset Password
            </h1>
            <p className="text-slate-300 font-light">
              Choose a new password for your account
            </p>
          </motion.div>

          {/* Card */}
          <motion.div variants={itemVariants} className="group relative">
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300"
              whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}
            />

            <div className="relative p-10 sm:p-12">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 mb-2">
                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Password Reset!</h2>
                  <p className="text-slate-300 text-sm">
                    Your password has been updated. Redirecting to login...
                  </p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mt-4"
                  />
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="password" className="block text-sm font-bold text-white mb-3">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 opacity-50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-800/50 border-2 border-cyan-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all duration-200"
                        placeholder="Minimum 6 characters"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="password2" className="block text-sm font-bold text-white mb-3">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 opacity-50" />
                      <input
                        type={showPassword2 ? "text" : "password"}
                        id="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-800/50 border-2 border-cyan-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all duration-200"
                        placeholder="Re-enter your password"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/30 border-2 border-red-400/60 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-200 text-sm font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Reset Password
                        <Lock className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
        />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
