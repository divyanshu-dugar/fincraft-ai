export default function IncomeStats({ stats, formatCurrency }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-slate-800/60 rounded-lg border border-cyan-400/20 p-6">
        <p className="text-sm font-medium text-slate-400">Total Income</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalIncome)}</p>
      </div>

      <div className="bg-slate-800/60 rounded-lg border border-cyan-400/20 p-6">
        <p className="text-sm font-medium text-slate-400">Total Categories</p>
        <p className="text-2xl font-bold text-white">{stats.categoryStats.length}</p>
      </div>

      <div className="bg-slate-800/60 rounded-lg border border-cyan-400/20 p-6">
        <p className="text-sm font-medium text-slate-400">Transactions</p>
        <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
      </div>

      <div className="bg-slate-800/60 rounded-lg border border-cyan-400/20 p-6">
        <p className="text-sm font-medium text-slate-400">Avg. Income</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(stats.avgIncome)}</p>
      </div>
    </div>
  );
}