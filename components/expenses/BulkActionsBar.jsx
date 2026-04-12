"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Tag, Calendar, X, ChevronDown } from "lucide-react";

export default function BulkActionsBar({
  selectedCount,
  onBulkDelete,
  onBulkRecategorize,
  onBulkEditDate,
  onClearSelection,
  categories = [],
}) {
  const [activeAction, setActiveAction] = useState(null); // 'recategorize' | 'editDate' | null
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) return null;

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCount} expense${selectedCount > 1 ? "s" : ""}? This cannot be undone.`
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await onBulkDelete();
    } finally {
      setLoading(false);
    }
  };

  const handleRecategorize = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      await onBulkRecategorize(selectedCategory);
      setActiveAction(null);
      setSelectedCategory("");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDate = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      await onBulkEditDate(selectedDate);
      setActiveAction(null);
      setSelectedDate("");
    } finally {
      setLoading(false);
    }
  };

  // Flatten category tree into a list of subcategories for the picker
  const flatCategories = categories.flatMap((parent) => {
    const subs = (parent.subcategories || []).map((sub) => ({
      _id: sub._id,
      name: `${parent.name} › ${sub.name}`,
      icon: sub.icon,
      color: sub.color,
    }));
    // Include parent itself if it has no subcategories or is standalone
    if (subs.length === 0) {
      return [{ _id: parent._id, name: parent.name, icon: parent.icon, color: parent.color }];
    }
    return subs;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/10 p-4">
          {/* Main bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-sm font-bold">
                {selectedCount} selected
              </span>
              <button
                onClick={onClearSelection}
                className="text-slate-400 hover:text-white text-xs underline underline-offset-2 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Recategorize */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveAction(activeAction === "recategorize" ? null : "recategorize")}
                disabled={loading}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeAction === "recategorize"
                    ? "bg-indigo-500/30 border border-indigo-400/60 text-indigo-200"
                    : "bg-slate-700/60 border border-slate-600/60 text-slate-300 hover:bg-indigo-500/20 hover:border-indigo-400/40 hover:text-indigo-200"
                } disabled:opacity-50`}
              >
                <Tag size={15} />
                Re-categorize
              </motion.button>

              {/* Edit Date */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveAction(activeAction === "editDate" ? null : "editDate")}
                disabled={loading}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeAction === "editDate"
                    ? "bg-amber-500/30 border border-amber-400/60 text-amber-200"
                    : "bg-slate-700/60 border border-slate-600/60 text-slate-300 hover:bg-amber-500/20 hover:border-amber-400/40 hover:text-amber-200"
                } disabled:opacity-50`}
              >
                <Calendar size={15} />
                Edit Date
              </motion.button>

              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleBulkDelete}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 hover:border-rose-400/60 hover:text-rose-200 transition-all duration-200 disabled:opacity-50"
              >
                <Trash2 size={15} />
                Delete
              </motion.button>
            </div>
          </div>

          {/* Expanded action panels */}
          <AnimatePresence>
            {activeAction === "recategorize" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center gap-3">
                  <label className="text-sm text-slate-400 whitespace-nowrap">
                    Move to:
                  </label>
                  <div className="relative flex-1 max-w-sm">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none bg-slate-800 border border-slate-600 text-white text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select category...</option>
                      {flatCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRecategorize}
                    disabled={!selectedCategory || loading}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Apply"}
                  </motion.button>
                  <button
                    onClick={() => { setActiveAction(null); setSelectedCategory(""); }}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeAction === "editDate" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center gap-3">
                  <label className="text-sm text-slate-400 whitespace-nowrap">
                    New date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-800 border border-slate-600 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEditDate}
                    disabled={!selectedDate || loading}
                    className="px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Apply"}
                  </motion.button>
                  <button
                    onClick={() => { setActiveAction(null); setSelectedDate(""); }}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
