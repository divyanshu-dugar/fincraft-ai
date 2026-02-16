'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  Goal,
  Briefcase,
  Wrench,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  LayoutDashboard,
} from "lucide-react";

export default function CombinedFeatures() {
  const allItems = [
    // Core Tools
    {
      icon: BarChart3,
      title: "Ledgerify",
      description: "Intelligent expense and income tracking with smart categorization, CSV imports, and real-time analytics dashboard.",
      gradient: "from-blue-500 to-cyan-500",
      href: '/expense/list',
      isCore: true
    },
    {
      icon: Goal,
      title: "Goalify",
      description: "Set ambitious savings goals, track progress with visual indicators, and achieve milestones with smart reminders.",
      gradient: "from-emerald-500 to-teal-500",
      href: '/goal/list',
      isCore: true
    },
    {
      icon: Briefcase,
      title: "Budgetify",
      description: "Create smart budgets by category, monitor spending in real-time, and get alerts when approaching limits.",
      gradient: "from-violet-500 to-purple-500",
      href: '/budget/list',
      isCore: true
    },
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      description: "Comprehensive financial overview with real-time visualizations of budgets, expenses, income, and goal progress.",
      gradient: "from-rose-500 to-pink-500",
      href: '/dashboard',
      isCore: true
    },
    // AI-Powered Features
    {
      icon: MessageCircle,
      title: "AI Financial Advisor",
      description: "Ask natural language questions about your finances. Get instant answers and clarifications tailored to your unique situation.",
      gradient: "from-amber-500 to-orange-500",
      comingSoon: true
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "AI-driven analysis of your spending patterns, goal feasibility, and financial health. Understand your money like never before.",
      gradient: "from-cyan-500 to-blue-500",
      comingSoon: true
    },
    {
      icon: Lightbulb,
      title: "Personalized Insights",
      description: "Context-aware recommendations for spending adjustments, savings strategies, and financial optimization based on your goals.",
      gradient: "from-yellow-500 to-lime-500",
      comingSoon: true
    },
    {
      icon: Wrench,
      title: "Utility Tools",
      description: "Advanced tax calculator, real-time currency converter, and essential financial tools for every situation.",
      gradient: "from-slate-500 to-gray-600",
      comingSoon: true
    },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 lg:py-48">
      {/* Animated gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: [0.3, 0.5, 0.3],
            y: [-20, 20, -20],
            x: [0, 30, 0],
          }}
          transition={{
            scale: { duration: 0.6 },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: [0.2, 0.4, 0.2],
            y: [20, -20, 20],
            x: [0, -40, 0],
          }}
          transition={{
            scale: { duration: 0.8, delay: 0.1 },
            opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 14, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-3xl opacity-15"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: [0.15, 0.35, 0.15],
            y: [-15, 15, -15],
          }}
          transition={{
            scale: { duration: 0.7, delay: 0.2 },
            opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full blur-3xl opacity-10"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik02MCAwdjYwTTAgNjBIMzAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwuMDI1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 backdrop-blur-xl shadow-lg shadow-cyan-500/20 mb-8"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              AI-Powered Guidance Tools
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight"
          >
            Your Personal Finance{" "} <br/>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Core tracking tools powered by AI-driven guidance. Manage income, expenses, and goals while receiving personalized insights, smart recommendations, and instant financial advice through our conversational AI advisor.
          </motion.p>
        </motion.div>

        {/* Unified Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {allItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative h-full"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300"
                  whileHover={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.25)" }}
                />

                <div className="relative p-6 sm:p-8 h-full flex flex-col">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 12 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <Icon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                  </motion.div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    {item.title}

                  </h3>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light flex-grow group-hover:text-slate-200 transition-colors">
                    {item.description}
                  </p>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 + 0.3, duration: 0.7 }}
                    className="mt-5 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent origin-left rounded-full"
                  />

                  {item.comingSoon ? (
                    <motion.button
                      disabled
                      className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 bg-slate-700/30 text-slate-400 border border-slate-600/50 cursor-not-allowed"
                    >
                      Coming Soon
                    </motion.button>
                  ) : (
                    <Link href={item.href}>
                      <motion.button
                        whileHover={{ scale: 1.05, x: 4 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/30 hover:border-cyan-400/60"
                      >
                        Explore
                        <motion.svg
                          animate={{ x: [0, 2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </motion.button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-28 text-center"
        >
          <p className="text-slate-300 text-lg font-light mb-8">Get your personal finance mentor that adapts to your goals</p>
          <motion.div
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="relative inline-block group"
          >
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <button className="relative group/btn inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl shadow-2xl shadow-cyan-500/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              
              <motion.div
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              
              <span className="relative flex items-center gap-3">
                Get Started Now
                <motion.svg 
                  className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
