import { LineChart } from "lucide-react";
import { useRouter } from "next/navigation";

export function RecentTransactionsTable({ dashboardData, formatCurrencyDetailed }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Recent Transactions
          </h2>
          <p className="text-gray-500 text-sm">
            Latest income and expenses
          </p>
        </div>
        <button
          onClick={() => router.push('/expense/list')}
          className="text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          View All →
        </button>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {dashboardData?.recentTransactions?.map(
              (transaction, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {transaction.note || "No description"}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            transaction.category?.color || "#9CA3AF",
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {transaction.category?.name || "Uncategorized"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.__typename === "Income"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {transaction.__typename === "Income"
                        ? "Income"
                        : "Expense"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p
                      className={`font-semibold ${
                        transaction.__typename === "Income"
                          ? "text-emerald-600"
                          : "text-gray-900"
                      }`}
                    >
                      {transaction.__typename === "Income" ? "+" : "-"}
                      {formatCurrencyDetailed(transaction.amount)}
                    </p>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {(!dashboardData?.recentTransactions ||
          dashboardData.recentTransactions.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LineChart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
