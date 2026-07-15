import { Head } from '@inertiajs/react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

import { SummaryCards } from './components/summary-cards';
import { SpendingChart } from './components/spending-chart';
import { RecentTransactions } from './components/recent-transactions';
import { FeatureOverviewCards } from './components/feature-overview-cards';
import { WalletDonutChart } from './components/wallet-donut-chart';
import { GoalsProgress } from './components/goals-progress';
import { BudgetProgress } from './components/budget-progress';

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

interface WalletDistributionItem {
    name: string;
    balance: number;
    type: string;
    color: string | null;
}

interface BudgetItem {
    id: number;
    name: string;
    limit: number;
    spent: number;
    category: string | null;
    period: string;
}

interface GoalItem {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    progress: number;
    deadline: string | null;
    color: string | null;
    icon: string | null;
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
    walletsDistribution: WalletDistributionItem[];
    budgetsSummary: {
        count: number;
        total_limit: number;
        total_spent: number;
    };
    topBudgets: BudgetItem[];
    goalsSummary: {
        count: number;
        avg_progress: number;
        nearest_deadline: string | null;
        nearest_name: string | null;
    };
    topGoals: GoalItem[];
    debtsSummary: {
        total_payable: number;
        total_receivable: number;
        overdue_count: number;
        count: number;
    };
    subscriptionsSummary: {
        count: number;
        monthly_cost: number;
        next_billing: string | null;
        next_name: string | null;
        days_until_next: number | null;
    };
}

export default function Dashboard({
    stats,
    chartData,
    recentTransactions,
    wallets,
    walletsDistribution,
    budgetsSummary,
    topBudgets,
    goalsSummary,
    topGoals,
    debtsSummary,
    subscriptionsSummary,
}: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* Row 1 — Core Stats */}
                        <SummaryCards stats={stats} />

                        {/* Row 2 — Feature Overview Cards */}
                        <FeatureOverviewCards
                            budgetsSummary={budgetsSummary}
                            goalsSummary={goalsSummary}
                            debtsSummary={debtsSummary}
                            subscriptionsSummary={subscriptionsSummary}
                        />

                        {/* Row 3 — Spending Chart + Wallet Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-6">
                            <div className="lg:col-span-2">
                                <SpendingChart data={chartData} />
                            </div>
                            <WalletDonutChart wallets={walletsDistribution} />
                        </div>

                        {/* Row 4 — Goals & Budget Progress */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 lg:px-6">
                            <GoalsProgress items={topGoals} />
                            <BudgetProgress items={topBudgets} />
                        </div>

                        {/* Row 5 — Recent Transactions */}
                        <RecentTransactions data={recentTransactions} wallets={wallets} />
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            {
                title: 'Dashboard',
                href: dashboard(),
            },
        ]}
    >
        {page}
    </AppLayout>
);
