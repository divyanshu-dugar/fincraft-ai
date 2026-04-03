"use client";

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-12 bg-slate-700 rounded-xl w-64 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-2xl p-6 shadow-lg h-64"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
