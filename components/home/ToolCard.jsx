'use client';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ToolCard({ tool }) {
  const cardVariants = {
    rest: { x: 0, y: 0, scale: 1 },
    hover: { 
      x: 0, 
      y: -8, 
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.15, 
      rotate: 5,
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
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 rounded-2xl blur-xl group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-all duration-300 pointer-events-none" />

      {/* Card container with 3D effect */}
      <div className="relative h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-8 border border-slate-600 group-hover:border-slate-500 transition-all duration-300 overflow-hidden flex flex-col">
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

        {/* Coming Soon Badge */}
        {tool.comingSoon && (
          <div className="absolute top-6 right-6 z-10">
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white text-xs font-bold rounded-full backdrop-blur-sm border border-amber-400/50"
            >
              Coming Soon
            </motion.span>
          </div>
        )}

        {/* Icon Container with 3D effect */}
        <motion.div
          variants={iconVariants}
          initial="rest"
          whileHover="hover"
          className={`flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br ${tool.color} text-white text-4xl mb-6 relative shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">{tool.icon}</div>
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow">
          {tool.description}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-slate-600 to-transparent mb-6" />

        {/* Explore Link */}
        {!tool.comingSoon && (
          <Link
            href={tool.href}
            className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors group/link"
          >
            <span>Explore Tool</span>
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        )}

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-600/10 to-transparent rounded-tl-3xl pointer-events-none" />
      </div>
    </motion.div>
  );
}
