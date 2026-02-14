'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      content: 'Fincraft AI completely changed how I manage my income and expenses. The insights are incredible, and the interface is so intuitive. I\'ve never felt more in control of my finances.',
      rating: 5,
      image: '👩‍💼',
      company: 'Creative Studio',
    },
    {
      name: 'Michael Chen',
      role: 'Small Business Owner',
      content: 'Finally, a tool that understands business finances. The budget tracking and analytics have saved me thousands this year. It\'s like having a CFO in your pocket.',
      rating: 5,
      image: '👨‍💼',
      company: 'Tech Startup Inc',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Investment Manager',
      content: 'The AI recommendations are spot-on. I\'ve been able to optimize my portfolio and reach my financial goals faster than expected. Highly recommended for anyone serious about wealth.',
      rating: 5,
      image: '👩‍💻',
      company: 'Finance Pro',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-32 sm:py-40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 backdrop-blur-sm mb-8"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-cyan-300">
              Loved by Users Everywhere
            </span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Success Stories from Our{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Community
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See how Fincraft AI is helping people achieve their financial dreams.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300" />

              <div className="relative p-8 flex flex-col h-full">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-300 leading-relaxed mb-8 flex-grow italic group-hover:text-slate-200 transition-colors">
                  "{testimonial.content}"
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-slate-600 via-cyan-500/30 to-slate-600 mb-8" />

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-slate-400 text-xs">{testimonial.role}</p>
                    <p className="text-cyan-400 text-xs font-semibold">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
