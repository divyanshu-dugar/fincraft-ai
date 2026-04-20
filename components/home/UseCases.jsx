"use client";

import { motion } from "framer-motion";
import { TrendingUp, Home, Briefcase, BookOpen, Heart, GraduationCap } from "lucide-react";
import Image from "next/image";

export default function UseCases() {
  const useCases = [
    {
      icon: Home,
      title: "The Overwhelmed Tracker",
      subtitle: "From data confusion to actionable clarity",
      description: "You track your spending but don't know what it means or what to do next. Fincraft AI transforms raw data into clear insights, automatically identifying spending patterns, recommending adjustments, and guiding you toward better financial decisions — without the stress.",
      stats: ["Clear Financial Insights", "Actionable Recommendations", "Reduced Financial Anxiety"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Young Professionals",
      subtitle: "AI guidance tailored to your trajectory",
      description: "Build wealth with confidence at any income level. Get personalized recommendations adapted to your salary, career growth potential, and financial priorities — whether that's paying off student loans, building an emergency fund, or planning for the future.",
      stats: ["Career-aligned guidance", "Smart financial planning", "Confident decision-making"],
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Briefcase,
      title: "Freelancers & Side Hustlers",
      subtitle: "Guidance for your unique income patterns",
      description: "Fincraft AI understands variable income. Automatically analyze fluctuating earnings, identify cash flow patterns, get personalized spending recommendations, and understand month-to-month variations — tailored specifically to freelancers and gig workers.",
      stats: ["Income pattern insights", "Cash flow clarity", "Smart expense management"],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      title: "Students & Recent Graduates",
      subtitle: "Build financial literacy from the ground up",
      description: "Starting your financial journey can feel overwhelming. Fincraft AI meets you where you are — helping with budgeting, debt management, and financial literacy through personalized guidance that adapts to your income level and goals.",
      stats: ["Debt clarity", "Financial education", "Confidence building"],
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Heart,
      title: "Goal-Driven Savers",
      subtitle: "Make your financial goals realistic and achievable",
      description: "You have clear goals but aren't sure if they're realistic or how to get there. Fincraft AI analyzes your financial situation, assesses goal feasibility, breaks down the steps needed, and provides ongoing guidance to keep you on track.",
      stats: ["Goal feasibility analysis", "Personalized action plan", "Progress tracking"],
      color: "from-rose-500 to-red-500",
    },
    {
      icon: GraduationCap,
      title: "Budget Optimizers",
      subtitle: "Understand and improve your spending habits",
      description: "You want to stretch your money further. Fincraft AI identifies optimization opportunities in your spending, suggests practical adjustments without feeling restrictive, and helps you align expenses with your priorities and values.",
      stats: ["Spending insights", "Optimization opportunities", "Habit improvement"],
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
    <section className="relative bg-gradient-to-b from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 py-24 sm:py-32 lg:py-40 overflow-hidden">
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

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
            Who Gets{" "}
            <span className="bg-gradient-to-r from-cyan-400 through-blue-400 to-purple-400 bg-clip-text text-transparent">
              Personalized Guidance
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto font-light">
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
                  className="absolute -inset-1 bg-gradient-to-br from-slate-100/50 dark:from-slate-800/50 to-white/50 dark:to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300"
                  whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}
                />

                <div className="relative p-6 sm:p-8">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 12 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-6 shadow-xl`}
                  >
                    <Icon className="w-8 h-8 text-slate-900 dark:text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-cyan-400 font-semibold text-xs mb-4">{useCase.subtitle}</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-light text-sm group-hover:text-slate-800 dark:text-slate-200 transition-colors">
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
                        <span className="text-slate-700 dark:text-slate-300">{stat}</span>
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
