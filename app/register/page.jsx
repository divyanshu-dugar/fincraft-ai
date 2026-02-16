'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { registerUser } from "@/lib/authenticate";
import { createDefaultCategories } from "@/lib/utils/defaultCategoriesManager";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function Register() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setWarning("");

    if (password !== password2) {
      setWarning("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setWarning("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await registerUser(user, password, password2);
      router.push("/login");
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 mb-6"
            >
              <User className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-2">
              Create Account
            </h1>
            <p className="text-slate-300 font-light">
              Join Fincraft AI and take control of your finances
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            variants={itemVariants}
            className="group relative"
          >
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-emerald-400/30 group-hover:border-emerald-400/60 transition-all duration-300"
              whileHover={{ boxShadow: "0 0 40px rgba(16, 185, 129, 0.2)" }}
            />

            <div className="relative p-10 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="userName" className="block text-sm font-bold text-white mb-3">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 opacity-50" />
                    <input
                      type="text"
                      id="userName"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-emerald-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 transition-all duration-200"
                      placeholder="Choose a username"
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm font-bold text-white mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 opacity-50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength="6"
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-800/50 border border-emerald-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 transition-all duration-200"
                      placeholder="At least 6 characters"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="password2" className="block text-sm font-bold text-white mb-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 opacity-50" />
                    <input
                      type={showPassword2 ? "text" : "password"}
                      id="password2"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-800/50 border border-emerald-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 transition-all duration-200"
                      placeholder="Confirm your password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword2(!showPassword2)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {showPassword2 ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
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
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl"
                    whileHover={{ boxShadow: "0 0 30px rgba(16, 185, 129, 0.5)" }}
                  />
                  <motion.div className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.div>
                </motion.button>
              </form>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-400/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-400">
                    Already have an account?
                  </span>
                </div>
              </motion.div>

              {/* Login Link */}
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-slate-300 text-sm font-light mb-2">
                  Sign in to your existing account
                </p>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl border border-emerald-400/50 text-emerald-300 font-bold hover:border-emerald-400/80 hover:bg-emerald-400/10 transition-all"
                  >
                    Sign In Instead
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div variants={itemVariants} className="space-y-3">
            {[
              "Real-time expense tracking",
              "Smart budget management",
              "Goal-based savings",
              "Bank-level security",
              "Instant financial insights",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 text-slate-300 text-sm"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="font-light">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Security Notice */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2 text-slate-400 text-sm"
          >
            <Lock className="w-4 h-4 text-emerald-400/50" />
            <span>Your data is protected with military-grade encryption</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}