import { Head } from '@inertiajs/react';
import React from "react";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from '@/routes';

import { SummaryCards } from './components/summary-cards';
import { SpendingChart } from './components/spending-chart';
import { RecentTransactions } from './components/recent-transactions';

interface Wallet {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'digital';
  color: string | null;
  current_balance: number | string;
  notes: string | null;
}

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string | null;
  icon: string | null;
}

interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number | null;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number | string;
  date: string;
  notes: string | null;
  wallet: Wallet;
  category: Category | null;
}

interface DashboardProps {
  stats: {
    total_balance: number;
    monthly_income: number;
    monthly_expense: number;
    net_flow: number;
    income_change: number;
    expense_change: number;
    net_flow_change: number;
  };
  chartData: {
    date: string;
    income: number;
    expense: number;
  }[];
  recentTransactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
}

export default function Dashboard({ stats, chartData, recentTransactions, wallets }: DashboardProps) {
  return (
    <>
      <Head title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SummaryCards stats={stats} />
            <div className="px-4 lg:px-6">
              <SpendingChart data={chartData} />
            </div>
            <RecentTransactions data={recentTransactions} wallets={wallets} />
          </div>
        </div>
      </div>
    </>
  );
}

Dashboard.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={[
    {
      title: 'Dashboard',
      href: dashboard(),
    },
  ]}>
    {page}
  </AppLayout>
);
