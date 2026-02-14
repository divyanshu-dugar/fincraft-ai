'use client';
import ToolCard from "./ToolCard";
import { motion } from "framer-motion";

export default function FinancialTools() {
  const tools = [
    {
      name: 'Ledgerify',
      description: 'Intelligent expense and income tracking with smart categorization, CSV imports, and real-time analytics dashboard.',
      icon: '📊',
      color: 'from-blue-500 to-cyan-500',
      href: '/expense/list'
    },
    {
      name: 'Goalify',
      description: 'Set ambitious savings goals, track progress with visual indicators, and achieve milestones with smart reminders.',
      icon: '💰',
      color: 'from-emerald-500 to-teal-500',
      href: '/goal/list'
    },
    {
      name: 'Budgetify',
      description: 'Create smart budgets by category, monitor spending in real-time, and get alerts when approaching limits.',
      icon: '📈',
      color: 'from-violet-500 to-purple-500',
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
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="tools" className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-24 sm:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Complete Financial Suite
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Thrive Financially
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Powerful tools designed to transform your financial life. From tracking to planning, we've got you covered.
          </motion.p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {tools.map((tool) => (
            <motion.div key={tool.name} variants={itemVariants}>
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-20 text-center"
        >
          <p className="text-slate-300 mb-6">Ready to transform your finances?</p>
          <button className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1">
            Get Started Now
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
