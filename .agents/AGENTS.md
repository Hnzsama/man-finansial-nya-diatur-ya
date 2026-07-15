<RULE>
# Finance Modules UI/UX Guidelines

These rules apply whenever you create or modify pages in the `resources/js/pages/` directory, particularly for the finance-related modules (Wallets, Transactions, Budgets, Categories, Goals, etc.).

## 1. Dynamic, Dashboard-Style Layouts
Do NOT generate simple CRUD data tables as the sole interface for any finance module. All pages must follow the high-end, rich visual aesthetic introduced in the main Dashboard. 

## 2. Mandatory Components
- **Summary Cards**: At the top of every page, include Shadcn `Card` components to show key metrics (e.g., Total Balance, Monthly Spend, Active Budgets) with relevant micro-charts or percentage changes.
- **Interactive Visualizations**: Incorporate charts (using `recharts`) to display data trends. Do not rely entirely on raw text or tables.
- **Modern Interactions**: Utilize elements like Drawers (instead of standard modals) for detailed views, and ToggleGroups for filtering data or time ranges. 

## 3. Emphasize "Shadcn UI"
You must build interfaces predominantly using the existing Shadcn UI components provided in `resources/js/components/ui`. Combine elements creatively to construct comprehensive user flows.

## 4. Example
A "Transactions" page shouldn't just be a `<Table>`. It should have:
1. A top section with `SectionCards` showing "Income", "Expense", and "Net".
2. A small `AreaChart` or `BarChart` for spending patterns.
3. A rich `DataTable` below with interactive actions (e.g., Drawers to view transaction receipts).
</RULE>

## 5. Controller Best Practices
- ALWAYS wrap all controller methods (index, store, update, destroy, etc.) in `try...catch` blocks.
- ALWAYS use `DB::transaction()` for any data modification operations (store, update, destroy).
