"use client";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pb-20 py-20 animate-pulse">
      {/* Header bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-300/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-3 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category breakdown */}
          <div className="lg:col-span-2 bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-4">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-48 bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1 h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-3">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-3">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-20 bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-4">
          <div className="h-6 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
              </div>
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
