import { CreditCard, DollarSign, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 p-6 mb-8 shadow-lg">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/expense/add')}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <CreditCard size={20} />
          <span>Add Expense</span>
        </button>
        <button
          onClick={() => router.push('/income/add')}
          className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <DollarSign size={20} />
          <span>Add Income</span>
        </button>
        <button
          onClick={() => router.push('/goal/add')}
          className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <Target size={20} />
          <span>Add Goal</span>
        </button>
      </div>
    </div>
  );
}