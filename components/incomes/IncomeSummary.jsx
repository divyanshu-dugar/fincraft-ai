export default function IncomeSummary({ incomes, formatCurrency }) {
  const total = incomes.reduce((sum, e) => sum + e.amount, 0);
  return (
    <div className="mt-6 bg-green-50 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-green-900">Total for selected period:</span>
        <span className="text-2xl font-bold text-green-900">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}