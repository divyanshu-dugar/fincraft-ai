"use client";

export default function ConfirmDeleteModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Confirm Deletion</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete this goal? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:scale-105 shadow-lg transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
