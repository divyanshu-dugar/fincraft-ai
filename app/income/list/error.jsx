"use client";

export default function IncomeListError({ error, reset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="max-w-md w-full p-8 bg-slate-800/90 rounded-2xl shadow-2xl border border-red-500/30 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Income List Error</h2>
        <p className="text-slate-300 mb-4 text-center">Sorry, something went wrong loading your income.<br />Please try again or contact support.</p>
        <button
          className="mt-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white font-semibold shadow"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
