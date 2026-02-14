'use client';

import { motion } from 'framer-motion';
import { BarChart3, Lock, Zap, TrendingUp, Brain, Bell } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Get instant insights into your spending patterns with AI-powered analytics and detailed visualizations.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Lock,
      title: 'Bank-Level Security',
      description: 'Your data is protected with military-grade encryption. We prioritize your privacy above all else.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience blazing-fast performance with optimized algorithms and instant data synchronization.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description: 'AI-powered recommendations help you save more, invest better, and achieve financial goals faster.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Get personalized financial advice powered by advanced AI that understands your unique situation.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Receive intelligent notifications about budget limits, unusual spending, and goal milestones.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Fincraft AI?
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Packed with powerful features designed to transform your financial life and put you in complete control.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.7 }}
                className="group relative"
                whileHover={{ y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300" />

                <div className="relative p-8">
                  {/* Icon with gradient background */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </motion.div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {benefit.description}
                  </p>

                  {/* Bottom accent */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.12 + 0.3, duration: 0.7 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent origin-left"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
