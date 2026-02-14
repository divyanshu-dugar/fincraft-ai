'use client';

import { motion } from 'framer-motion';

export default function TechStack() {
  const technologies = [
    {
      category: 'Frontend',
      items: ['Next.js 15', 'React 19', 'Tailwind CSS', 'Framer Motion'],
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Express.js', 'MongoDB', 'JWT Auth'],
    },
    {
      category: 'AI & Analytics',
      items: ['Machine Learning', 'Data Analytics', 'NPL Processing', 'Predictive Models'],
    },
    {
      category: 'Security',
      items: ['Encryption', 'SSL/TLS', 'Data Privacy', 'Compliance'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
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
            Built on Modern{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Technology
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Fincraft AI is built with the latest and greatest technologies to ensure performance, security, and reliability.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300" />

              <div className="relative p-8">
                <h3 className="text-xl font-bold text-white mb-6 text-center group-hover:text-cyan-300 transition-colors">
                  {tech.category}
                </h3>

                <ul className="space-y-3">
                  {tech.items.map((item, itemIndex) => (
                    <motion.li
                      key={itemIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.12 + itemIndex * 0.06 }}
                      className="flex items-center gap-3 text-slate-300 group-hover:text-slate-200 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}