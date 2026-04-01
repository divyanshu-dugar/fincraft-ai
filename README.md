Problem - Current Personal Finance applications work as passive trackers

What are we doing?
1. Making logging of financial data easier
   - PDFs/CSV
   - SS
  
 2. Giving you personalized financial advice
    - Month on Month Categorical Spending Comparison
    - 

<h2>Developers Here!</h2>
<details>
 
<summary>👉🏻 Project Directory Structure </summary>
<br/>

```
📁 fincraft-ai/
├── 📁 app/
│   ├── 📁 budget/
│   │   ├── 📁 add/
│   │   │   └── ⚛️ page.jsx
│   │   ├── 📁 edit/
│   │   │   └── 📁 [id]/
│   │   │       └── ⚛️ page.jsx
│   │   └── 📁 list/
│   │       └── ⚛️ page.jsx
│   ├── 📁 dashboard/
│   │   └── ⚛️ page.jsx
│   ├── 📁 expense/
│   │   ├── 📁 add/
│   │   │   └── ⚛️ page.jsx
│   │   ├── 📁 category/
│   │   │   └── ⚛️ page.tsx
│   │   ├── 📁 edit/
│   │   │   └── 📁 [_id]/
│   │   │       └── ⚛️ page.jsx
│   │   └── 📁 list/
│   │       └── ⚛️ page.jsx
│   ├── 📁 goal/
│   │   ├── 📁 add/
│   │   │   └── ⚛️ page.jsx
│   │   ├── 📁 edit/
│   │   │   └── ⚛️ page.jsx
│   │   └── 📁 list/
│   │       └── ⚛️ page.jsx
│   ├── 📁 income/
│   │   ├── 📁 add/
│   │   │   └── ⚛️ page.jsx
│   │   ├── 📁 category/
│   │   │   └── ⚛️ page.jsx
│   │   ├── 📁 edit/
│   │   │   └── 📁 [_id]/
│   │   │       └── ⚛️ page.jsx
│   │   └── 📁 list/
│   │       └── ⚛️ page.jsx
│   ├── 📁 login/
│   │   └── ⚛️ page.jsx
│   ├── 📁 register/
│   │   └── ⚛️ page.jsx
│   ├── 🎨 globals.css
│   ├── ⚛️ layout.jsx
│   └── ⚛️ page.jsx
├── 📁 components/
│   ├── 📁 budgets/
│   │   ├── ⚛️ AddBudget.jsx
│   │   ├── ⚛️ BudgetFilters.jsx
│   │   ├── ⚛️ BudgetList.jsx
│   │   ├── ⚛️ BudgetStats.jsx
│   │   ├── ⚛️ BudgetTable.jsx
│   │   ├── ⚛️ EditBudget.jsx
│   │   └── ⚛️ LoadingSpinner.jsx
│   ├── 📁 expenses/
│   │   ├── ⚛️ ExpenseDistribution.jsx
│   │   ├── ⚛️ ExpenseFilters.jsx
│   │   ├── ⚛️ ExpenseList.jsx
│   │   ├── ⚛️ ExpenseStats.jsx
│   │   ├── ⚛️ ExpenseSummary.jsx
│   │   ├── ⚛️ ExpenseTable.jsx
│   │   ├── ⚛️ ImportExpensesModel.jsx
│   │   └── ⚛️ LoadingSpinner.jsx
│   ├── 📁 goals/
│   │   ├── ⚛️ ConfirmDeleteModal.jsx
│   │   ├── ⚛️ GoalCard.jsx
│   │   ├── ⚛️ GoalFormModal.jsx
│   │   ├── ⚛️ GoalGrid.jsx
│   │   ├── ⚛️ GoalsHeader.jsx
│   │   └── ⚛️ LoadingSkeleton.jsx
│   ├── 📁 home/
│   │   ├── ⚛️ FinancialTools.jsx
│   │   ├── ⚛️ GitHub.jsx
│   │   ├── ⚛️ HeroSection.jsx
│   │   ├── ⚛️ TechStack.jsx
│   │   └── ⚛️ ToolCard.jsx
│   ├── 📁 incomes/
│   │   ├── ⚛️ IncomeDistribution.jsx
│   │   ├── ⚛️ IncomeFilters.jsx
│   │   ├── ⚛️ IncomeList.jsx
│   │   ├── ⚛️ IncomeStats.jsx
│   │   ├── ⚛️ IncomeSummary.jsx
│   │   ├── ⚛️ IncomeTable.jsx
│   │   └── ⚛️ LoadingSpinner.jsx
│   ├── 📁 ui/
│   │   ├── ⚛️ button.tsx
│   │   ├── ⚛️ card.tsx
│   │   ├── ⚛️ dialog.tsx
│   │   ├── ⚛️ input.tsx
│   │   ├── ⚛️ label.tsx
│   │   ├── ⚛️ progress.tsx
│   │   └── ⚛️ skeleton.tsx
│   ├── ⚛️ Navbar.jsx
│   └── ⚛️ RouteGuard.jsx
├── 📁 lib/
│   ├── 🟨 authenticate.js
│   └── 🟦 utils.ts
├── 📁 public/
│   └── 🖼️ logo.png
├── 📄 .gitignore
├── 🔢 components.json
├── 📄 eslint.config.mjs
├── 🔢 jsconfig.json
├── 📄 next.config.mjs
├── 🔢 package-lock.json
├── 🔢 package.json
├── 📄 postcss.config.mjs
├── 📄 README.md
├── 🟨 tailwind.config.js
└── 🔢 tsconfig.json
```
</details>

<details>
<summary>👉🏻 Expense Module Directory Structure</summary>

```
📦 app
 ┣ 📂 expense/list/
 ┃ ┣ 📜 page.jsx                    # Main Expenses Page
 📂 components
 ┣ 📂 expenses/
 ┃ ┃ ┣ 📜 ExpenseDistribution.jsx   # Visualizes category-wise distribution using PieChart
 ┃ ┃ ┣ 📜 ExpenseFilters.jsx        # Handles filtering expense by date/category
 ┃ ┃ ┣ 📜 ExpenseList.jsx           # Core logic, API calls, state handling
 ┃ ┃ ┣ 📜 ExpenseSummary.jsx        # Bottom total summary
 ┃ ┃ ┗ 📜 ExpenseStats.jsx          # Summary cards
 ┗ 
```

</details>

<details>
<summary>👉🏻 Expense API Routes</summary>

## Authentication - Passport JWT

### expenses

| Method | Endpoint | Description | Headers | Body | Response |
|--------|----------|-------------|---------|------|----------|
| `GET` | `/expenses` | Get user expenses | `Authorization` | - | `[expenses]` |
| `POST` | `/expenses` | Create expense | `Authorization` | `{amount, category, type, date}` | `{expense}` |
| `PUT` | `/expenses/:id` | Update expense | `Authorization` | `{amount, category}` | `{expense}` |
| `DELETE` | `/expenses/:id` | Delete expense | `Authorization` | - | `{message}` |


</details>
