'use client';
import ToolCard from "./ToolCard";
import { motion } from "framer-motion";

export default function FinancialTools() {
  const tools = [
    {
      name: 'Ledgerify',
      description: 'Intelligent expense and income tracking with smart categorization, CSV imports, and real-time analytics dashboard.',
      icon: '📊',
      color: 'from-cyan-500 to-blue-600',
      href: '/expense/list'
    },
    {
      name: 'Goalify',
      description: 'Set ambitious savings goals, track progress with visual indicators, and achieve milestones with smart reminders.',
      icon: '💰',
      color: 'from-emerald-500 to-teal-600',
      href: '/goal/list'
    },
    {
      name: 'Budgetify',
      description: 'Create smart budgets by category, monitor spending in real-time, and get alerts when approaching limits.',
      icon: '📈',
      color: 'from-violet-500 to-purple-600',
      href: '/budget/list'
    },
    {
      name: 'Investify',
      description: 'Learn investment strategies with AI guidance, discover market opportunities, and grow wealth intelligently.',
      icon: '🚀',
      color: 'from-orange-500 to-red-500',
      comingSoon: true
    },
    {
      name: 'Utility Tools',
      description: 'Advanced tax calculator, real-time currency converter, and essential financial tools for every situation.',
      icon: '🛠️',
      color: 'from-slate-500 to-gray-600',
      comingSoon: true
    },
    {
      name: 'AI Insights',
      description: 'Personalized financial recommendations powered by advanced machine learning and behavioral analytics.',
      icon: '🤖',
      color: 'from-pink-500 to-rose-600',
      comingSoon: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section id="tools" className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 150, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-cyan-600/15 to-blue-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-gradient-to-tl from-purple-600/15 to-pink-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 backdrop-blur-sm mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold text-cyan-300">
              Complete Financial Suite
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Thrive Financially
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Powerful, intuitive tools designed to transform your financial life. From tracking to planning and intelligent insights.
          </motion.p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {tools.map((tool) => (
            <motion.div key={tool.name} variants={itemVariants}>
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center"
        >
          <p className="text-slate-300 text-lg mb-8">Ready to transform your finances?</p>
          <button className="group relative inline-flex items-center gap-2 px-10 py-4 text-white font-bold rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Get Started Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
