export default function ExpenseSummary({ expenses, formatCurrency }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return (
    <div className="mt-6 bg-blue-500/15 border border-blue-500/30 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-blue-300">Total for selected period:</span>
        <span className="text-2xl font-bold text-blue-300">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
