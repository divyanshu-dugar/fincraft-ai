export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="text-cyan-300 font-bold text-lg">Loading…</span>
      </div>
    </div>
  );
}
