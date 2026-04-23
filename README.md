<details>
<summary>Refinements List</summary>
# Fincraft — SaaS-Level Improvements Roadmap

## 💰 Monetization & Subscription

1. **Add a Pricing / Subscription page** — Free tier (basic tracking), Pro tier (AI chat, advanced analytics, unlimited categories), show feature comparison table
2. **Integrate Stripe payment gateway** — handle subscription lifecycle (checkout, billing portal, invoice emails, plan upgrades/downgrades)
3. **Add usage quotas on free tier** — e.g., 50 expenses/month, 5 AI chat messages/day, 3 budgets max — with upgrade prompts when limits are hit
4. **Add a billing settings page** — users can view invoices, update payment method, cancel/resume subscription

## 🤖 AI & Intelligence

- [ ] 5. **"Explore with AI" button on expense/income analytics pages** — one-click sends current view's data to AI, returns plain-language insights + actionable recommendations (e.g., "your food spending is 40% higher than last month — consider meal prepping")
6. **AI-generated weekly/monthly financial summary emails** — opt-in digest with spending trends, budget alerts, goal progress, and AI recommendations
7. **Proactive AI alerts** — push/email notifications like "You've already spent 85% of your Food budget and it's only the 15th"
8. **Smart categorization** — when adding an expense, AI auto-suggests the category based on the note/description (using embeddings you already generate)
9. **Natural language expense entry** — type "spent $45 on groceries yesterday" and AI parses it into a structured expense
10. **AI-powered financial health score** — more sophisticated than current rule-based scoring, using spending patterns, budget adherence, savings consistency, and goal progress
11. **Anomaly detection** — AI flags unusual transactions (e.g., "This $500 purchase is 3x your average in this category")
12. **"What-if" scenario modeling** — "What if I reduce dining out by 30%? How much would I save in 6 months?"


## 📊 Analytics & Data Visualization

- [ ] 13. **Dedicated analytics dashboard per module** — expense analytics, income analytics, budget analytics (currently only listed in navbar, pages may be incomplete)
- [ ] 14. **Year-over-year comparison charts** — compare Jan 2025 vs Jan 2026 spending
- [ ] 15. **Cash flow forecast** — project future income/expenses based on recurring patterns and trends
16. **Savings velocity tracker** — for each goal, show a chart of contribution pace vs the required pace to hit deadline
17. **Interactive drill-down charts** — click on a category in the pie chart to see individual transactions
18. **Export reports as PDF** — monthly financial statement, budget report, tax-ready expense summaries
- [ ] 19. **Custom date range on all pages** — currently dashboard has this, extend to all list/analytics views


## 🔐 Auth & Security

- [ ] 20. **Add JWT token expiration** — currently `jwt.sign()` has no `expiresIn`, tokens never expire (critical security issue)
- [ ] 21. **Add refresh token rotation** — short-lived access tokens (15 min) + long-lived refresh tokens with rotation
- [ ] 22. **Add email verification on registration** — prevent fake signups, verify email before allowing login
- [ ] 23. **OAuth social login** — Google, Apple sign-in for frictionless onboarding
24. **Two-factor authentication (2FA)** — TOTP-based (Google Authenticator) for account security
25. **Rate limiting on all endpoints** — prevent brute-force attacks on login, API abuse
26. **Input validation with a library** — add `zod`, `joi` or `express-validator` for consistent server-side validation (currently minimal)
27. **CSRF protection** — if you ever move to cookie-based auth
28. **Security headers** — add `helmet` middleware to Express for HTTP security headers


## 🏗️ Architecture & Code Quality

29. **Centralize API client on frontend** — create a shared `apiClient.js` with interceptors for auth headers, token refresh, error handling (currently raw `fetch()` calls everywhere)
30. **Add global error boundary** — React error boundary component to catch and display errors gracefully
31. **Add a state management solution** — React Context or Zustand for auth state, user profile, theme preferences (currently re-reading localStorage on every component mount)
32. **Move business logic to API** — dashboard currently calculates trends, health score, insights client-side; this should be a server endpoint
33. **Add request/response logging middleware** — structured JSON logging with request IDs for debugging and monitoring
- [ ] 34. **Add API versioning** — prefix routes with `/v1/` to allow future breaking changes
- [ ] 35. **Consistent route naming** — some routes use `/expenses`, others use `/api/auth` — standardize to `/api/v1/*` for everything
36. **Add TypeScript to the API** — currently pure JS with no type safety; adding TS catches bugs at build time
37. **Add database migrations/seeding** — scripts to set up initial categories, demo data for new users
- [ ] 38. **Add health check endpoint to API** — `/api/health` returning DB connection status, uptime, version



## 🎨 UX & Frontend Polish

39. **Add a proper onboarding flow** — after registration, guide users: set currency → create categories → add first expense → set first budget → tour of AI chat
- [ ] 40. **Empty states for all pages** — when no expenses/budgets/goals exist, show helpful illustrations + CTAs ("Add your first expense!")
41. **Add a global command palette** — `Cmd+K` to quickly navigate, search transactions, or start an AI query
- [ ] 42. **Multi-currency support** — let users set their default currency, display with correct symbol/formatting
43. **Keyboard shortcuts** — `N` to add new expense, `D` for dashboard, `Esc` to close modals
- [ ] 44. **Toast notifications for operations** — already using `react-hot-toast` but ensure every create/update/delete shows confirmation
- [ ] 45. **Skeleton loading states** — replace spinners with skeleton screens (you already have the `Skeleton` shadcn component)
46. **Dark/Light theme toggle** — currently only dark mode; some users prefer light
47. **Add breadcrumb navigation** — helps users understand where they are, especially on edit pages
- [ ] 48. **Responsive tables** — expense/income tables should be card layouts on mobile, not horizontally scrolling tables
- [ ] 49. **Add a sidebar layout** — for authenticated pages, a persistent sidebar with nav items is more efficient than dropdown menus for a SaaS app
- [ ] 50. **Add a footer** — with links to docs, support, terms of service, privacy policy



## 📱 Mobile & PWA

51. **Make it a Progressive Web App (PWA)** — add service worker, manifest.json, offline support, "Add to Home Screen"
52. **Optimize for mobile-first** — ensure all forms, charts, and tables work perfectly on small screens
53. **Add pull-to-refresh** — on list pages when used on mobile
54. **Add haptic feedback** — subtle vibrations on actions when supported



## 📦 Data Management

- [ ] 55. **Bulk operations** — select multiple expenses and bulk delete, bulk re-categorize, bulk edit dates
56. **Data export** — export all data as CSV/JSON (GDPR compliance, user portability)
57. **Data import from banks** — CSV import already exists; add template matching for popular banks (Chase, RBC, etc.)
- [ ] 58. **Recurring expense automation** — auto-create expenses from recurring patterns (e.g., auto-log Netflix $15.99 on the 1st of each month)
59. **Transaction search** — full-text search bar across all transactions (beyond the AI semantic search)
60. **Soft delete with undo** — instead of permanent deletes, soft-delete with a 30-second undo toast
61. **Archive old data** — allow users to archive previous years' data to keep the active view clean



## 🔔 Notifications & Engagement

- [ ] 62. **In-app notification center** — bell icon in navbar showing budget alerts ✅, goal milestones 🟡, AI tips 🟡
63. **Email notification preferences** — let users toggle: weekly digest, budget alerts, goal reminders
- [ ] 64. **Budget alert emails** — when spending hits 80%/100% of budget
65. **Goal milestone celebrations** — confetti animation when a savings goal hits 25%, 50%, 75%, 100%



## 🧪 Testing & Quality

66. **Add frontend tests** — Jest + React Testing Library for critical flows (login, add expense, dashboard loads)
67. **Expand API test coverage** — currently only basic Jest/Supertest; add tests for auth flow, CRUD operations, edge cases
68. **Add end-to-end tests** — Playwright or Cypress for critical user journeys
69. **Add CI/CD pipeline** — GitHub Actions to run tests, lint, build on every PR
70. **Add error tracking** — Sentry or similar for catching runtime errors in production



## ⚙️ Infrastructure & DevOps

71. **Environment-based configuration** — ensure `.env` values are documented in `.env.example` files for all 3 projects
72. **Add Docker support for frontend & LLM** — API has it in fragments, extend to the whole monorepo
73. **Add database indexes** — ensure `expenses`, `incomes`, `budgets` have compound indexes on `(user, date)` for query performance
74. **Add API response caching** — Redis or in-memory caching for dashboard aggregations (they're expensive)
75. **Set up monitoring** — uptime monitoring, response time tracking, alert on downtime
76. **Move LLM service off Render free tier** — cold starts are terrible for UX; use a warm instance
77. **Add request timeouts** — the AI chat proxy has no timeout; if the LLM service hangs, the API hangs too
78. **Add database connection pooling** — both the API and LLM service create new connections; add connection pool limits



## 📄 Legal & Compliance

79. **Add Terms of Service page**
80. **Add Privacy Policy page** — especially important for a finance app handling sensitive data
81. **Add cookie consent banner** — if using analytics
82. **GDPR data deletion** — "Delete my account and all data" button in profile settings
83. **Add data encryption at rest** — encrypt sensitive fields in MongoDB (notes, amounts)



## 🌐 Growth & Marketing

84. **Add a landing page redesign** — case studies, testimonials, feature showcase, pricing, FAQ
85. **Add an interactive demo mode** — let visitors try the app with fake data without registering
86. **Add referral system** — "Invite friends, get 1 month of Pro free"
87. **Add SEO meta tags per page** — currently only root layout has metadata; add page-specific titles/descriptions
88. **Add OpenGraph + Twitter cards** — for social sharing previews
89. **Add a changelog/what's new page** — keep users informed about new features
90. **Add a feedback widget** — in-app button to submit feature requests or bug reports



> **Suggested priority order:** 20 → 29 → 39 → 5 → 1–2 → 21 → 30 → 38 → 69 → 9
> *(Fix security first → clean up code → improve UX → add AI features → monetize → CI/CD)*

</details>

# Problem - Current Personal Finance applications work as passive trackers

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
|--|-|-|||-|
| `GET` | `/expenses` | Get user expenses | `Authorization` | - | `[expenses]` |
| `POST` | `/expenses` | Create expense | `Authorization` | `{amount, category, type, date}` | `{expense}` |
| `PUT` | `/expenses/:id` | Update expense | `Authorization` | `{amount, category}` | `{expense}` |
| `DELETE` | `/expenses/:id` | Delete expense | `Authorization` | - | `{message}` |


</details>
