'use client';
import ToolCard from "./ToolCard";

export default function FinancialTools() {
  const tools = [
    { name: 'Ledgerify', description: 'Track your income and expenses seamlessly with Income & Expense Trackers.', icon: '📊', color: 'from-blue-500 to-cyan-500', href: '/expense/list' },
    { name: 'Goalify', description: 'Set, track, and achieve your savings goals - one step at a time.', icon: '💰', color: 'from-green-500 to-emerald-500', href: '/goal/list'},
    { name: 'Budgetify', description: 'Manage your budget and plan better every month.', icon: '📈', color: 'from-purple-500 to-pink-500', href: '/budget/list'},
    { name: 'Investify', description: 'Learn to invest smartly and grow your wealth.', icon: '🚀', color: 'from-orange-500 to-red-500', comingSoon: true },
    { name: 'Other Tools', description: 'Tax Calculator, Currency Converter, and more utility tools.', icon: '🛠️', color: 'from-gray-500 to-slate-600', comingSoon: true}
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Financial Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive suite of tools to manage every aspect of your financial life
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
