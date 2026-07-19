import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ReportController';
import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { CashFlowChart } from './components/cash-flow-chart';
import { CategoryDistribution } from './components/category-distribution';
import { WalletDistribution } from './components/wallet-distribution';

interface MonthlyTrendItem { month: string; income: string | number; expense: string | number; }
interface CategoryValue { category: string; value: string | number; }
interface WalletValue { wallet: string; value: string | number; }

interface PageProps {
  summary: { total_income: number; total_expense: number; net_savings: number };
  categoriesDistribution: CategoryValue[];
  monthlyTrend: MonthlyTrendItem[];
  walletsDistribution: WalletValue[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Financial Reports', href: reportsIndex.url() }];

export default function ReportsIndex({ summary, categoriesDistribution, monthlyTrend, walletsDistribution }: PageProps) {
  const trendData = monthlyTrend.map(item => ({
    date: item.month,
    income: typeof item.income === 'string' ? parseFloat(item.income) : item.income,
    expense: typeof item.expense === 'string' ? parseFloat(item.expense) : item.expense,
  }));

  return (
    <>
      <Head title="Financial Reports" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Financial Reports &amp; Statistics</h2>
              <p className="text-sm text-muted-foreground font-light">
                Comprehensive cash flow summary, category analysis, and assets distribution.
              </p>
            </div>

            <CollapsibleSummary>
              <SummaryCards
                totalIncome={summary.total_income}
                totalExpense={summary.total_expense}
                netSavings={summary.net_savings}
              />
            </CollapsibleSummary>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CashFlowChart data={trendData} />
              <div className="space-y-6">
                <CategoryDistribution items={categoriesDistribution} />
                <WalletDistribution items={walletsDistribution} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ReportsIndex.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
