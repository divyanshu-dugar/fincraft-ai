"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp, BarChart3, PieChart } from "lucide-react";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const orbVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (index) => ({
      scale: 1,
      opacity: [0.3, 0.6, 0.3],
      y: [-20, 20, -20],
      transition: {
        scale: { duration: 0.6, delay: index * 0.1 },
        opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      },
    }),
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-20, 20, -20],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen flex items-center">
      {/* Animated gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          custom={0}
          variants={orbVariants}
          initial="initial"
          animate="animate"
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          custom={1}
          variants={orbVariants}
          initial="initial"
          animate="animate"
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-3xl opacity-15"
        />
        <motion.div
          custom={2}
          variants={orbVariants}
          initial="initial"
          animate="animate"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full blur-3xl opacity-10"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik02MCAwdjYwTTAgNjBIMzAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwuMDI1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="z-10"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm font-semibold text-cyan-200">
                  AI-Powered Finance Platform
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-6xl sm:text-7xl md:text-7xl font-bold text-white mb-8 leading-tight"
            >
              Fincraft{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                AI
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed"
            >
              Your personal finance coach. A complete financial ecosystem designed for modern wealth management.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/expense/list"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Start Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-cyan-400/50 text-white font-bold rounded-xl hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm"
              >
                Explore Features
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex gap-8 text-sm">
              <div className="border-l border-cyan-400/50 pl-4">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-slate-400">Secure & Private</div>
              </div>
              <div className="border-l border-cyan-400/50 pl-4">
                <div className="text-2xl font-bold text-white">Real-time</div>
                <div className="text-slate-400">Tracking</div>
              </div>
              <div className="border-l border-cyan-400/50 pl-4">
                <div className="text-2xl font-bold text-white">AI</div>
                <div className="text-slate-400">Insights</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right visual showcase - 3D style cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:block relative h-96"
          >
            {/* Card 1 - Expenses */}
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              className="absolute top-0 right-0 w-64 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 shadow-2xl shadow-cyan-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Expenses</span>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-white">$2,450</div>
                <div className="text-sm text-slate-400">This month</div>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-cyan-500 to-blue-600" />
              </div>
            </motion.div>

            {/* Card 2 - Income */}
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: "0.5s" }}
              className="absolute bottom-10 left-0 w-64 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/20 shadow-2xl shadow-emerald-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Income</span>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-white">$5,200</div>
                <div className="text-sm text-slate-400">This month</div>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">↑ 12% from last month</div>
            </motion.div>

            {/* Card 3 - Goals */}
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: "1s" }}
              className="absolute top-1/2 right-1/4 w-64 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20 shadow-2xl shadow-purple-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Goals Progress</span>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold text-white">$8,500</div>
                <div className="text-sm text-slate-400">of $15,000 saved</div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-pink-600" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
