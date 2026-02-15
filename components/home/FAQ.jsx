"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does Fincraft AI provide personalized guidance?",
      answer: "Fincraft AI analyzes your unique income, expenses, goals, and budgets to understand your financial situation. It then uses advanced AI to deliver context-aware recommendations tailored specifically to you, not generic advice. Think of it as having a personal financial coach who knows your complete picture.",
    },
    {
      question: "What kind of financial advice can I get?",
      answer: "You can ask Fincraft AI anything about your finances using plain English. It provides personalized insights on your spending patterns, goal feasibility, savings strategies, and spending adjustments. You can also get actionable recommendations for optimizing your budget and achieving your goals faster.",
    },
    {
      question: "How does the AI understand my financial situation?",
      answer: "You provide your income sources, expenses, and financial goals. The AI analyzes spending patterns, identifies trends, and learns your priorities. Over time, it becomes an increasingly accurate advisor that adapts to your unique circumstances and financial behaviors.",
    },
    {
      question: "Is my financial data secure and private?",
      answer: "Absolutely. We use bank-level 256-bit AES encryption for all data in transit and at rest. Your data is never sold, shared, or used to train models on other users. You have complete control and can export or delete your data anytime.",
    },
    {
      question: "Can I import my existing financial data?",
      answer: "Yes! You can manually input your financial information or import data from CSV files and other platforms. Our AI automatically categorizes transactions and organizes your data intelligently.",
    },
    {
      question: "How do I interact with the AI advisor?",
      answer: "Simply ask questions in plain English through our natural language chat interface. Ask about your spending habits, goal progress, budget recommendations, or any financial question—the AI responds with insights tailored to your data.",
    },
    {
      question: "Can I set multiple goals and budgets?",
      answer: "Yes! You can create unlimited financial goals, budgets by category, and track multiple income and expense sources. Fincraft adapts its guidance based on all your goals and priorities working together.",
    },
    {
      question: "What happens if I cancel my subscription?",
      answer: "You can cancel anytime with no penalties. We'll help you export all your data in standard formats. Your financial information belongs to you—we're here to be your trusted advisor, not lock you in.",
    },
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
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 16, repeat: Infinity }}
          className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tr from-purple-500/15 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 backdrop-blur-xl shadow-lg shadow-cyan-500/20 mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Questions?
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-cyan-400 through-blue-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light">
            Learn more about how Fincraft AI becomes your personalized financial mentor and advisor.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full relative group/button"
              >
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-2xl rounded-2xl border border-cyan-400/20 group-hover/button:border-cyan-400/50 transition-all duration-300"
                  whileHover={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)" }}
                />

                <div className="relative p-8 flex items-center justify-between">
                  <div className="flex items-start gap-6 flex-1 text-left">
                    <motion.div
                      animate={{ scale: openIndex === index ? 1.1 : 1 }}
                      className="mt-1 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0 border border-cyan-400/30"
                    >
                      <MessageCircle className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover/button:text-cyan-300 transition-colors">
                      {faq.question}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="ml-6 flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                </div>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="relative px-8 pb-8 pt-4 border-t border-cyan-400/20"
                    >
                      <p className="text-slate-300 leading-relaxed font-light text-lg">
                        {faq.answer}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.9 }}
          className="mt-16 relative group"
        >
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-2xl rounded-3xl border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300"
            whileHover={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.3)" }}
          />

          <div className="relative p-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to meet your financial mentor?</h3>
            <p className="text-slate-300 mb-8 font-light">
              Start getting personalized financial guidance adapted to your unique situation. Our support team is here to help you get started.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
            >
              Get Started Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
