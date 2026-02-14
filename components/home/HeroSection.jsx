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

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-20, 20, -20],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center">
      {/* Premium gradient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-blue-200">
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
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                AI
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed"
            >
              Your personal finance coach. A complete financial ecosystem in one platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/expense/list"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                Start Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-400 text-white font-bold rounded-xl hover:bg-white/10 hover:border-slate-300 transition-all duration-300 backdrop-blur-sm"
              >
                Explore Features
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex gap-8 text-sm">
              <div className="border-l border-slate-400 pl-4">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-slate-400">Secure & Private</div>
              </div>
              <div className="border-l border-slate-400 pl-4">
                <div className="text-2xl font-bold text-white">Real-time</div>
                <div className="text-slate-400">Tracking</div>
              </div>
              <div className="border-l border-slate-400 pl-4">
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
              className="absolute top-0 right-0 w-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 shadow-2xl shadow-blue-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Expenses</span>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-white">$2,450</div>
                <div className="text-sm text-slate-400">This month</div>
              </div>
              <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-blue-600" />
              </div>
            </motion.div>

            {/* Card 2 - Income */}
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: "0.5s" }}
              className="absolute bottom-10 left-0 w-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 shadow-2xl shadow-emerald-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
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
              className="absolute top-1/2 right-1/4 w-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 shadow-2xl shadow-purple-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Goals Progress</span>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold text-white">$8,500</div>
                <div className="text-sm text-slate-400">of $15,000 saved</div>
              </div>
              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-purple-600" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
