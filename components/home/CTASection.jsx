'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';

export default function CTASection() {
  const features = [
    { icon: Shield, text: '100% Secure' },
    { icon: Zap, text: 'Instant Sync' },
    { icon: Lock, text: 'Private Data' },
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/3 -left-1/3 w-full h-full bg-gradient-to-br from-cyan-600/20 to-blue-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-1/3 -right-1/3 w-full h-full bg-gradient-to-tl from-purple-600/20 to-pink-600/15 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
          >
            Ready to Transform{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Your Finances?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Join thousands of users who are already taking control of their financial futures with Fincraft AI. Start for free, no credit card required.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex justify-center mb-16"
          >
            <div className="relative group">
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity"
              />
              <Link
                href="/register"
                className="relative group/btn inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                Get Started Free
                <motion.span
                  className="group-hover/btn:translate-x-1 transition-transform"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-8 pt-12 border-t border-slate-700"
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.12, duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-slate-300 font-semibold">{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
