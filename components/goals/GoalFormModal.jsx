"use client";

export default function GoalFormModal({ formData, setFormData, onSubmit, onCancel, editing }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300/50 dark:border-slate-700/50">
        <div className="p-6 border-b border-slate-300 dark:border-slate-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            {editing ? "Edit Goal" : "Create New Goal"}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Goal name"
            className="w-full px-4 py-3 border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          <input
            type="number"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Target Amount"
            className="w-full px-4 py-3 border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <input
            type="date"
            required
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-4 py-3 border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none [color-scheme:dark]"
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-3 border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="low">Low 🌱</option>
            <option value="medium">Medium ⚡</option>
            <option value="high">High 🔥</option>
          </select>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            className="w-full px-4 py-3 border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:bg-slate-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:scale-105 shadow-lg transition-all cursor-pointer"
            >
              {editing ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
