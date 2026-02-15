"use client";

import { motion } from "framer-motion";
import { ChevronRight, Play, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

export default function Demo() {
  const [activeDevice, setActiveDevice] = useState("desktop");

  const screenshots = {
    desktop: {
      title: "D Dashboard",
      description: "Full-featured desktop interface with rich visualizations",
      image: "bg-gradient-to-br from-cyan-500/20 to-blue-500/20",
    },
    mobile: {
      title: "Mobile App",
      description: "Manage finances on-the-go with our iOS and Android apps",
      image: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
    },
    tablet: {
      title: "Tablet Experience",
      description: "Perfect balance of desktop power and mobile convenience",
      image: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
    },
  };

  const demoFeatures = [
    {
      title: "Real-Time Dashboard",
      description: "Monitor all your finances in one comprehensive overview",
    },
    {
      title: "Smart Categorization",
      description: "AI automatically organizes your transactions perfectly",
    },
    {
      title: "Budget Visualization",
      description: "Beautiful charts show exactly where your money goes",
    },
    {
      title: "Goal Progress",
      description: "Watch your financial goals come to life with live progress",
    },
    {
      title: "Investment Tracking",
      description: "See all your investments in one unified portfolio view",
    },
    {
      title: "Alerts & Notifications",
      description: "Smart notifications keep you informed of important events",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-36 sm:py-48 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.15, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 0.9, 1],
            x: [0, -60, 0],
          }}
          transition={{ duration: 24, repeat: Infinity }}
          className="absolute -bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-tr from-purple-500/15 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
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
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              See It In Action
            </span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Beautiful Interface,{" "}
            <span className="bg-gradient-to-r from-cyan-400 through-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light">
            Experience the future of personal finance with our stunning, intuitive dashboard.
          </p>
        </motion.div>

        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mb-24"
        >
          {/* Device Selector */}
          <div className="flex justify-center gap-6 mb-16">
            {[
              { id: "desktop", icon: Monitor, label: "Desktop" },
              { id: "tablet", icon: Tablet, label: "Tablet" },
              { id: "mobile", icon: Smartphone, label: "Mobile" },
            ].map((device) => {
              const Icon = device.icon;
              return (
                <motion.button
                  key={device.id}
                  onClick={() => setActiveDevice(device.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg font-bold transition-all ${
                    activeDevice === device.id
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                      : "bg-slate-800/50 text-slate-300 border border-cyan-400/20 hover:border-cyan-400/60"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{device.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Screenshot Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/60 transition-all"
              whileHover={{ boxShadow: "0 0 50px rgba(6, 182, 212, 0.2)" }}
            />

            <div className="relative p-8 sm:p-12">
              <motion.div
                key={activeDevice}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`aspect-video rounded-2xl ${screenshots[activeDevice].image} border border-cyan-400/30 flex items-center justify-center relative overflow-hidden group/demo`}
                >
                  {/* Simulated Dashboard Content */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-60" />
                        <p className="font-bold text-white/60 text-sm">Dashboard</p>
                      </div>
                      <p className="text-white/40 text-xs">Welcome back to Fincraft</p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      {[
                        { label: "Balance", value: "$12,458.50" },
                        { label: "Income", value: "$4,200.00" },
                        { label: "Expenses", value: "$2,145.32" },
                        { label: "Savings", value: "+$2,054.68" },
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="bg-white/5 backdrop-blur rounded-lg p-3 border border-white/10"
                        >
                          <p className="text-white/40 text-xs font-light mb-1">{stat.label}</p>
                          <p className="text-white/80 font-bold text-sm">{stat.value}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Play Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all z-10"
                  >
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  {screenshots[activeDevice].title}
                </h3>
                <p className="text-slate-300 font-light">
                  {screenshots[activeDevice].description}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -6 }}
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-2xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all"
                whileHover={{ boxShadow: "0 0 25px rgba(6, 182, 212, 0.15)" }}
              />

              <div className="relative p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 flex items-center justify-center mb-5"
                >
                  <ChevronRight className="w-6 h-6 text-cyan-400" />
                </motion.div>

                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h4>

                <p className="text-slate-300 font-light text-sm leading-relaxed group-hover:text-slate-200 transition-colors">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="text-center"
        >
          <p className="text-slate-300 text-lg mb-8 font-light">
            Ready to see Fincraft in action?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all inline-flex items-center gap-2"
          >
            Start Free Demo
            <Play className="w-5 h-5 fill-white" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
