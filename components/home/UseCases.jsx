"use client";

import { motion } from "framer-motion";
import { TrendingUp, Home, Briefcase, BookOpen, Heart, GraduationCap } from "lucide-react";
import Image from "next/image";

export default function UseCases() {
  const useCases = [
    {
      icon: Home,
      title: "First-Time Homebuyers",
      subtitle: "Personalized guidance to reach your dream",
      description: "Get tailored advice on down payment savings, closing costs, and mortgage readiness. Our AI adapts to your income and timeline, turning the home-buying process from overwhelming to clear.",
      stats: ["Clarity on mortgage readiness", "Personalized savings timeline", "Confidence in your decision"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Young Professionals",
      subtitle: "AI guidance tailored to your trajectory",
      description: "Receive personalized recommendations for 401(k) optimization, student loan strategy, and wealth building—all adapted to your unique career path and income growth potential.",
      stats: ["Career-aligned guidance", "Smart wealth strategy", "Confident financial decisions"],
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Briefcase,
      title: "Freelancers & Side Hustlers",
      subtitle: "Guidance for your unique income patterns",
      description: "Fincraft AI understands variable income. Get personalized advice on tax planning, cash flow management, and multiple revenue streams—with contextual recommendations based on your specific situation.",
      stats: ["Income pattern insights", "Tax-optimized strategy", "Cash flow clarity"],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      title: "Students",
      subtitle: "Guidance to graduate with confidence",
      description: "Navigate student loans, scholarships, and credit building with personalized mentorship. Get advice adapted to your education plan and financial goals—not generic budget tips.",
      stats: ["Debt management guidance", "Financial education", "Credit-building clarity"],
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Heart,
      title: "Families",
      subtitle: "United guidance for shared goals",
      description: "Get personalized advice for household budgets, college savings, insurance planning, and inheritance—all tailored to your family's unique values and priorities.",
      stats: ["Family-aligned planning", "Shared financial clarity", "Peace of mind"],
      color: "from-rose-500 to-red-500",
    },
    {
      icon: GraduationCap,
      title: "Retirees",
      subtitle: "Personalized guidance for your best years",
      description: "Get context-aware advice on withdrawals, pensions, Social Security, and longevity planning. Fincraft adapts to your retirement goals, ensuring your wealth strategy is uniquely yours.",
      stats: ["Retirement confidence", "Personalized strategy", "Sustainable withdrawals"],
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-tr from-purple-500/15 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 backdrop-blur-xl shadow-lg shadow-cyan-500/20 mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Real Stories
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
            Who Gets{" "}
            <span className="bg-gradient-to-r from-cyan-400 through-blue-400 to-purple-400 bg-clip-text text-transparent">
              Personalized Guidance
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Every person's financial journey is unique. Discover how Fincraft AI provides personalized guidance tailored to your specific situation.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
                whileHover={{ y: -8 }}
              >
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300"
                  whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}
                />

                <div className="relative p-6 sm:p-8">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 12 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-6 shadow-xl`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-cyan-400 font-semibold text-xs mb-4">{useCase.subtitle}</p>
                  <p className="text-slate-300 leading-relaxed mb-6 font-light text-sm group-hover:text-slate-200 transition-colors">
                    {useCase.description}
                  </p>

                  <div className="space-y-3">
                    {useCase.stats.map((stat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + 0.4 }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                        />
                        <span className="text-slate-300">{stat}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
