"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Linkedin, Twitter, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "#security" },
      { label: "Roadmap", href: "/roadmap" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
    Resources: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Status", href: "https://status.fincraft.ai" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
    { icon: Github, label: "GitHub", href: "https://github.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
    { icon: Mail, label: "Email", href: "mailto:hello@fincraft.ai" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 24, repeat: Infinity }}
          className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="relative border-t border-cyan-400/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
          <div className="relative group max-w-2xl mx-auto">
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-2xl rounded-3xl border border-cyan-400/40 group-hover:border-cyan-400/60 transition-all"
              whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}
            />

            <div className="relative p-10 sm:p-12 text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Stay Updated
              </h3>
              <p className="text-slate-300 text-lg mb-10 font-light">
                Get the latest updates, tips, and financial insights delivered to your inbox.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-xl bg-slate-800/50 border border-cyan-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {subscribed ? "✓ Subscribed!" : "Subscribe"}
                  {!subscribed && <ArrowRight className="w-5 h-5" />}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Footer */}
      <div className="relative border-t border-cyan-400/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16"
          >
            {Object.entries(footerLinks).map(([category, links]) => (
              <motion.div key={category} variants={itemVariants}>
                <h4 className="font-bold text-white text-lg mb-6">
                  {category}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <motion.li
                      key={link.label}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <a
                        href={link.href}
                        className="text-slate-300 hover:text-cyan-300 transition-colors font-light"
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="border-t border-cyan-400/10 pt-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  Fincraft AI
                </h1>
                <p className="text-slate-400 font-light">
                  Your personal finance operating system.
                </p>
              </div>

              <div className="flex items-center gap-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-lg bg-slate-800/50 border border-cyan-400/30 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400/60 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center text-slate-500 font-light text-sm space-y-2"
            >
              <p>
                © 2026 Fincraft. All rights reserved. | Built with ❤️ for your financial freedom
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
