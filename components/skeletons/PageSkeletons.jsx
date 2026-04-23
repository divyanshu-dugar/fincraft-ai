"use client";

/**
 * Skeleton for list pages (Expense List, Income List).
 * Mimics the hero header + filter bar + table rows layout.
 */
export function ListPageSkeleton({ accentFrom = "from-blue-600", accentVia = "via-indigo-600", accentTo = "to-purple-700" }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 py-6 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero header */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${accentFrom} ${accentVia} ${accentTo} rounded-3xl shadow-2xl p-8 mb-10 opacity-60`}>
          <div className="h-12 w-64 bg-white/20 rounded-xl mb-4" />
          <div className="flex flex-wrap gap-4">
            <div className="h-14 w-44 bg-white/20 rounded-2xl" />
            <div className="h-14 w-36 bg-white/10 rounded-2xl" />
            <div className="h-14 w-32 bg-white/10 rounded-2xl" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 flex-1 max-w-sm bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Table header */}
        <div className="hidden md:flex items-center gap-4 px-4 py-3 mb-2">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="flex-1" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Table rows */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
              </div>
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for form/edit pages (Edit Expense, Edit Income, Edit Budget).
 * Mimics the sticky header + form fields layout.
 */
export function EditFormSkeleton({ accentColor = "bg-blue-500" }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pt-6 animate-pulse">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-300/50 dark:border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <div className={`w-8 h-8 rounded-xl ${accentColor} opacity-40`} />
          <div className="space-y-1">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-2.5 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Amount card */}
        <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-4">
          <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Form fields */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-5 space-y-3">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-10 w-full bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
          </div>
        ))}

        {/* Submit button */}
        <div className="h-12 w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the profile page.
 * Mimics avatar + section cards layout.
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 animate-pulse">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-6">
        {/* Hero header */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-56 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
            <div className="h-3 w-32 bg-slate-200/40 dark:bg-slate-700/40 rounded" />
          </div>
          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Section cards */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-48 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
              <div className="h-10 bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for the goal detail page.
 * Mimics goal header + progress ring + contribution history.
 */
export function GoalDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 py-6 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-6" />

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-52 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-72 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>

        {/* Progress + stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-300 dark:border-slate-700" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-3">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-3 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
            </div>
          ))}
        </div>

        {/* Contribution history */}
        <div className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 space-y-4">
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex-1 h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for chat message loading area.
 * Mimics alternating message bubbles.
 */
export function ChatMessagesSkeleton() {
  return (
    <div className="flex flex-col gap-5 h-full justify-center px-4 animate-pulse">
      {[
        { align: "self-end", w: "w-48" },
        { align: "self-start", w: "w-64" },
        { align: "self-end", w: "w-36" },
        { align: "self-start", w: "w-56" },
      ].map((bubble, i) => (
        <div key={i} className={`${bubble.align} ${bubble.w} space-y-2`}>
          <div className={`h-10 rounded-2xl ${i % 2 === 0 ? "bg-emerald-500/15" : "bg-slate-100/60 dark:bg-slate-800/60"}`} />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for inline list areas (category list, budget card grid).
 * Shows a grid of placeholder cards.
 */
export function CardGridSkeleton({ count = 6, cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid ${cols} gap-4 animate-pulse`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
            </div>
          </div>
          <div className="h-2 w-full bg-slate-200/40 dark:bg-slate-700/40 rounded-full" />
          <div className="flex justify-between">
            <div className="h-3 w-14 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
            <div className="h-3 w-10 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for category list items.
 */
export function CategoryListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-2 animate-pulse py-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/40 dark:bg-slate-800/40">
          <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
          </div>
          <div className="h-4 w-8 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
        </div>
      ))}
    </div>
  );
}
