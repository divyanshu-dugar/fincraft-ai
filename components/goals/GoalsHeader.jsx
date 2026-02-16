"use client";

import { motion } from "framer-motion";
import { Plus, PiggyBank } from "lucide-react";

export default function GoalsHeader({ onNewGoal }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 p-[1px] shadow-xl mb-10"
    >
      {/* Glassmorphism inner container */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl px-8 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-5">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/30"
          >
            <PiggyBank size={36} className="text-white" />
          </motion.div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-purple-700 to-pink-600 bg-clip-text text-transparent tracking-tight leading-snug">
              Your Savings Goals
            </h1>
            <p className="text-gray-600 text-lg mt-2 max-w-xl">
              Stay on top of your progress, visualize your achievements, and make every dollar count.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={onNewGoal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 lg:mt-0 flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <Plus size={22} className="text-white" />
          <span>Create New Goal</span>
        </motion.button>

        {/* Gradient Orbs for depth */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-pink-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
      </div>
    </motion.section>
  );
}
