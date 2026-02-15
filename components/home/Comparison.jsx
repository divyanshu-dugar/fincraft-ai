"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function Comparison() {
  const features = [
    { name: "Expense Tracking", category: "Core Features" },
    { name: "Budget Management", category: "Core Features" },
    { name: "Income Tracking", category: "Core Features" },
    { name: "Goal Planning", category: "Core Features" },
    { name: "Real-time Alerts", category: "Advanced Features" },
    { name: "AI Financial Advisor", category: "Advanced Features" },
    { name: "Investment Tracking", category: "Advanced Features" },
    { name: "Tax Planning Tools", category: "Advanced Features" },
    { name: "Multi-Account Support", category: "Account Features" },
    { name: "Sub-Accounts (5+)", category: "Account Features" },
    { name: "API Access", category: "Developer Features" },
    { name: "Custom Integrations", category: "Developer Features" },
  ];

  const competitors = [
    {
      name: "Fincraft AI",
      tagline: "Your Complete Finance OS",
      color: "from-cyan-400 to-blue-400",
      highlighted: true,
    },
    {
      name: "Mint",
      tagline: "Basic Money Manager",
      color: "from-green-400 to-emerald-400",
      highlighted: false,
    },
    {
      name: "YNAB",
      tagline: "Budget Focused",
      color: "from-purple-400 to-pink-400",
      highlighted: false,
    },
    {
      name: "Traditional Bank",
      tagline: "Limited Tools",
      color: "from-slate-400 to-gray-400",
      highlighted: false,
    },
  ];

  const comparisonData = {
    "Fincraft AI": [true, true, true, true, true, true, true, true, true, true, true, true],
    Mint: [true, true, false, false, true, false, false, false, false, false, false, false],
    YNAB: [true, true, false, true, false, false, false, false, true, false, false, false],
    "Traditional Bank": [true, false, false, false, false, false, false, false, false, false, false, false],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 24, repeat: Infinity }}
          className="absolute -bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-tr from-purple-500/15 to-pink-500/10 rounded-full blur-3xl"
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
              Comparison
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-cyan-400 through-blue-400 to-purple-400 bg-clip-text text-transparent">
              Fincraft AI
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-light">
            See how we compare to other financial management platforms.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="overflow-x-auto mb-16"
        >
          <motion.div
            className="min-w-full relative group"
          >
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-2xl border border-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-300"
              whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.15)" }}
            />

            <div className="relative p-4 sm:p-6 lg:p-8">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-2 sm:px-4 font-bold text-white text-xs sm:text-sm">Features</th>
                    {competitors.map((comp) => (
                      <th key={comp.name} className="text-center py-4 px-1 sm:px-3">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                          className={`${comp.highlighted ? "px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40" : ""}`}
                        >
                          <div className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${comp.color} bg-clip-text text-transparent`}>
                            {comp.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{comp.tagline}</div>
                        </motion.div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 + 0.3 }}
                      className="border-t border-cyan-400/10 hover:bg-cyan-500/10 transition-colors"
                    >
                      <td className="py-4 px-2 sm:px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs sm:text-sm">{feature.name}</span>
                          <span className="text-xs text-slate-600 mt-0.5">{feature.category}</span>
                        </div>
                      </td>
                      {competitors.map((comp) => (
                        <td key={`${comp.name}-${feature.name}`} className="text-center py-4 px-1 sm:px-3">
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {comparisonData[comp.name][features.indexOf(feature)] ? (
                              <div className="flex justify-center">
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-400/50 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <div className="w-6 h-6 rounded-md bg-slate-700/30 border border-slate-600/50 flex items-center justify-center">
                                  <X className="w-4 h-4 text-slate-500" />
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>

        {/* Why We're Different */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              title: "AI-Powered",
              description: "Smart recommendations learn your patterns and adapt over time.",
            },
            {
              title: "Privacy First",
              description: "Your data never leaves your hands. Bank-level encryption always.",
            },
            {
              title: "Constantly Evolving",
              description: "New features added monthly based on user feedback.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -8 }}
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/60 transition-all"
                whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}
              />
              <div className="relative p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-slate-300 text-base sm:text-lg mb-6 font-light">
            Ready to experience the difference?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 sm:px-12 py-3 rounded-lg font-bold text-base sm:text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
