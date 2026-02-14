'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Zap, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StatisticsSection() {
  const [counters, setCounters] = useState({
    users: 0,
    transactions: 0,
    accuracy: 0,
    uptime: 0,
  });

  useEffect(() => {
    const intervals = {
      users: setInterval(() => {
        setCounters(prev => ({
          ...prev,
          users: prev.users < 50000 ? prev.users + 100 : 50000
        }))
      }, 10),
      transactions: setInterval(() => {
        setCounters(prev => ({
          ...prev,
          transactions: prev.transactions < 1000000 ? prev.transactions + 2000 : 1000000
        }))
      }, 5),
      accuracy: setInterval(() => {
        setCounters(prev => ({
          ...prev,
          accuracy: prev.accuracy < 99.9 ? prev.accuracy + 0.1 : 99.9
        }))
      }, 20),
      uptime: setInterval(() => {
        setCounters(prev => ({
          ...prev,
          uptime: prev.uptime < 99.99 ? prev.uptime + 0.01 : 99.99
        }))
      }, 30),
    };

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  const stats = [
    {
      icon: Users,
      value: counters.users.toLocaleString(),
      label: 'Active Users',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: TrendingUp,
      value: counters.transactions.toLocaleString(),
      label: 'Transactions Tracked',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Zap,
      value: `${counters.accuracy.toFixed(1)}%`,
      label: 'AI Accuracy',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Shield,
      value: `${counters.uptime.toFixed(2)}%`,
      label: 'System Uptime',
      gradient: 'from-cyan-500 to-blue-600',
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
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
            Trusted by Thousands Worldwide
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Join our growing community and see why users choose Fincraft AI for their financial journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.7 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300" />
                
                <div className="relative p-8 flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-2xl transition-all duration-300`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.div
                    key={`${index}-${stat.value}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="text-4xl sm:text-5xl font-bold text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>

                  <p className="text-slate-300 font-semibold group-hover:text-cyan-300 transition-colors">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
