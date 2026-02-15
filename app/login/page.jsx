'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { authenticateUser } from "@/lib/authenticate";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setWarning("");

    try {
      await authenticateUser(user, password);
      router.push("/dashboard");
    } catch (err) {
      setWarning(err.message);
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

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center pt-18 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated gradient orbs background */}
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
          {/* Logo & Title */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 mb-6"
            >
              <Lock className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-300 font-light">
              Sign in to your Fincraft AI account
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            variants={itemVariants}
            className="group relative"
          >
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300"
              whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}
            />

            <div className="relative p-10 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="userName" className="block text-sm font-bold text-white mb-3">
                    Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 opacity-50" />
                    <input
                      type="text"
                      id="userName"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-cyan-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all duration-200"
                      placeholder="Enter your username"
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm font-bold text-white mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 opacity-50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-800/50 border border-cyan-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all duration-200"
                      placeholder="Enter your password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Forgot Password */}
                <motion.div variants={itemVariants} className="flex justify-end">
                  <Link
                    href="#"
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                {/* Error Message */}
                {warning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-400/50 rounded-xl p-4"
                  >
                    <p className="text-red-300 text-sm font-medium">{warning}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative group/btn py-3 px-4 rounded-xl font-bold text-lg text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl"
                    whileHover={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
                  />
                  <motion.div className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.div>
                </motion.button>
              </form>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-400">
                    New to Fincraft?
                  </span>
                </div>
              </motion.div>

              {/* Register Link */}
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-slate-300 text-sm font-light mb-2">
                  Don't have an account?
                </p>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl border border-cyan-400/50 text-cyan-300 font-bold hover:border-cyan-400/80 hover:bg-cyan-400/10 transition-all"
                  >
                    Create New Account
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2 text-slate-400 text-sm"
          >
            <Lock className="w-4 h-4 text-cyan-400/50" />
            <span>Your data is protected with bank-level encryption</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}