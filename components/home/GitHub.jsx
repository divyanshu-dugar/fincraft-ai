'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Star, GitFork } from 'lucide-react';

export default function GitHub() {
  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-cyan-400/20 p-12 sm:p-16 text-center"
        >
          {/* GitHub Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-cyan-400/30">
              <Github className="w-10 h-10 text-cyan-400" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Open Source & Community Driven
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto"
          >
            Fincraft AI is built with transparency and community collaboration. Explore our GitHub repository, contribute to the project, and help us build the future of personal finance.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12 pb-12 border-b border-slate-700"
          >
            <motion.div
              whileHover={{ scale: 1.08, translateY: -4 }}
              className="flex items-center gap-3 px-6 py-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">2.5K+</div>
                <div className="text-sm text-slate-400">Stars on GitHub</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.08, translateY: -4 }}
              className="flex items-center gap-3 px-6 py-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
            >
              <GitFork className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold text-white">300+</div>
                <div className="text-sm text-slate-400">Forks & Contributions</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.08, translateY: -4 }}
              className="flex items-center gap-3 px-6 py-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
            >
              <div className="w-5 h-5 text-purple-400 text-lg">👥</div>
              <div>
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-sm text-slate-400">Active Contributors</div>
              </div>
            </motion.div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-6"
          >
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold rounded-xl border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:-translate-y-1"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </Link>
            <Link
              href="https://github.com/fincraft-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Contribute Now
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}