export default function IncomeListLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/80">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="text-emerald-300 font-bold text-lg">Loading income…</span>
      </div>
    </div>
  );
}
