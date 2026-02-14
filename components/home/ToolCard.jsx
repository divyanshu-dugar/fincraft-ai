'use client';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ToolCard({ tool }) {
  const cardVariants = {
    rest: { x: 0, y: 0, scale: 1 },
    hover: { 
      x: 0, 
      y: -12, 
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.2, 
      rotate: 8,
      transition: { duration: 0.3 }
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      className="group relative h-full"
    >
      {/* Glowing background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 to-blue-600/0 rounded-3xl blur-2xl group-hover:from-cyan-600/30 group-hover:to-blue-600/30 transition-all duration-500 pointer-events-none" />

      {/* Card main container */}
      <div className="relative h-full bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300 overflow-hidden flex flex-col shadow-2xl">
        
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Coming Soon Badge */}
        {tool.comingSoon && (
          <div className="absolute top-6 right-6 z-10">
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full border border-yellow-300/50"
            >
              Coming Soon
            </motion.span>
          </div>
        )}

        {/* Icon Container */}
        <motion.div
          variants={iconVariants}
          initial="rest"
          whileHover="hover"
          className={`flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${tool.color} text-white text-5xl mb-8 relative shadow-2xl group-hover:shadow-2xl transition-all duration-300`}
        >
          {/* Inner shine effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">{tool.icon}</div>
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow group-hover:text-slate-200 transition-colors">
          {tool.description}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-slate-600 via-cyan-500/30 to-slate-600 mb-6" />

        {/* Explore Link */}
        {!tool.comingSoon && (
          <Link
            href={tool.href}
            className="inline-flex items-center gap-2 text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors group/link"
          >
            <span>Explore →</span>
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        )}

        {/* Decorative corner glow */}
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-cyan-600/10 via-blue-600/10 to-transparent rounded-tl-3xl pointer-events-none" />
      </div>
    </motion.div>
  );
}
