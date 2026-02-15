"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for getting started",
      monthlyPrice: 5,
      annualPrice: 48,
      features: [
        "Basic expense tracking",
        "5 budget categories",
        "Monthly reports",
        "Email support",
        "Up to 3 sub-accounts",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Professional",
      description: "For serious savers",
      monthlyPrice: 15,
      annualPrice: 144,
      features: [
        "Advanced analytics",
        "Unlimited categories",
        "Real-time alerts",
        "Priority support",
        "Investment tracking",
        "Custom reports",
        "Up to 10 sub-accounts",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "Full power & control",
      monthlyPrice: 50,
      annualPrice: 480,
      features: [
        "Everything in Professional",
        "AI financial advisor",
        "Unlimited sub-accounts",
        "Advanced integrations",
        "Custom dashboards",
        "Dedicated support",
        "API access",
        "White-label options",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 0.95, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-purple-500/15 to-pink-500/10 rounded-full blur-3xl"
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
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 backdrop-blur-xl shadow-lg shadow-cyan-500/20 mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Simple Pricing
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Plans for Every{" "}
            <span className="bg-gradient-to-r from-cyan-400 through-blue-400 to-purple-400 bg-clip-text text-transparent">
              Budget
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-light mb-10">
            Choose the perfect plan to unlock financial control with no surprises.
          </p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <span className={`text-sm sm:text-base font-semibold transition-colors ${!isAnnual ? "text-white" : "text-slate-400"}`}>
              Monthly
            </span>
            <motion.button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-9 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ x: isAnnual ? 34 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-7 h-7 bg-white rounded-full shadow-lg"
              />
            </motion.button>
            <span className={`text-sm sm:text-base font-semibold transition-colors ${isAnnual ? "text-white" : "text-slate-400"}`}>
              Annual
              <span className="ml-3 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-400/50 text-sm text-emerald-300 font-bold">
                Save 20%
              </span>
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -12 }}
              className={`relative group h-full ${plan.highlighted ? "md:scale-105 md:shadow-2xl md:shadow-cyan-500/20" : ""}`}
            >
              {plan.highlighted && (
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-br from-cyan-500/50 to-blue-500/50 rounded-3xl blur-xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}

              <motion.div
                className={`absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border ${
                  plan.highlighted ? "border-cyan-400/60" : "border-cyan-400/20 group-hover:border-cyan-400/60"
                } transition-all duration-300 shadow-xl`}
                whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}
              />

              <div className="relative p-6 sm:p-8 flex flex-col h-full">
                {plan.highlighted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30"
                  >
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">Most Popular</span>
                  </motion.div>
                )}

                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 mb-6 text-xs sm:text-sm font-light">{plan.description}</p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-3">
                    <motion.span
                      key={isAnnual ? "annual" : "monthly"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                    >
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </motion.span>
                    <span className="text-xs sm:text-sm text-slate-400 font-light">{isAnnual ? "/year" : "/month"}</span>
                  </div>
                  {isAnnual && plan.monthlyPrice !== plan.annualPrice / 12 && (
                    <p className="text-xs sm:text-sm text-emerald-400 font-semibold">
                      Save ${(plan.monthlyPrice * 12 - plan.annualPrice).toFixed(0)}/year
                    </p>
                  )}
                </div>

                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `0 0 30px rgba(6, 182, 212, 0.4)` }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-lg font-bold text-base mb-8 transition-all duration-300 flex items-center justify-center gap-2 group ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50"
                        : "bg-slate-800/50 text-white border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-slate-700/50"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                <div className="space-y-3 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 + 0.4 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed group-hover:text-slate-200 transition-colors">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
