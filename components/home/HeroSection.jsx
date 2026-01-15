"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 px-6 sm:px-12 bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-700 text-white">
      {/* Decorative blurred background orbs */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 blur-3xl opacity-30 pointer-events-none">
        <div className="w-[800px] h-[400px] bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Title with animation */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-yellow-300 via-green-300 to-cyan-300 bg-clip-text text-transparent"
        >
          Fincraft AI
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto"
        >
          Your adaptive personal finance mentor.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link
            href="/expense/list"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-blue-700 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
          >
            Explore Here
            <svg
              className="w-6 h-6 text-blue-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Optional tagline */}
        {/* <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-12 text-sm text-blue-200"
        >
          Trusted by thousands of users worldwide 🌍
        </motion.p> */}
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
    </section>
  );
}
