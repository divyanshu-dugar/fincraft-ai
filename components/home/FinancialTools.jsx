'use client';
import ToolCard from "./ToolCard";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FinancialTools() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
    <section id="tools" className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 150, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, -80, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-tl from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl"
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
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 backdrop-blur-xl shadow-lg shadow-cyan-500/20 mb-8"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Complete Financial Suite
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight"
          >
            Everything to{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Thrive Financially
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Powerful financial tools designed for the modern individual. From tracking to planning, we've got every aspect of your financial life covered.
          </motion.p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
        >
          {tools.map((tool, index) => (
            <motion.div 
              key={tool.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.7 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <ToolCard tool={tool} isHovered={hoveredIndex === index} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-28 text-center"
        >
          <p className="text-slate-300 text-lg font-light mb-8">Ready to transform your financial journey?</p>
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
