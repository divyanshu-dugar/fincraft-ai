export default function IncomeSummary({ incomes, formatCurrency }) {
  const total = incomes.reduce((sum, e) => sum + e.amount, 0);
  return (
    <div className="mt-6 bg-emerald-500/15 rounded-lg border border-emerald-500/30 p-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-emerald-300">Total for selected period:</span>
        <span className="text-2xl font-bold text-emerald-300">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}