import { Head, router, useForm } from '@inertiajs/react';
import { IconPlus, IconArrowsRightLeft, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import React, { useState } from 'react';
import { index as transactionIndex, destroy as transactionDestroy } from '@/actions/App/Http/Controllers/TransactionController';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Transaction, Wallet, Category } from '@/types';
import { useTransactionColumns } from './components/columns';
import { DataTable } from './components/data-table';
import { FilterBar } from './components/filter-bar';
import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { TransactionSheet } from './components/transaction-sheet';
import { TransferSheet } from './components/transfer-sheet';

interface PageProps {
    transactions: {
        data: Transaction[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    wallets: Wallet[];
    categories: Category[];
    stats: {
        total_income: string;
        total_expense: string;
        net_flow: string;
        income_change: number;
        expense_change: number;
    };
    filters: {
        start_date: string;
        end_date: string;
        wallet_id: string;
        category_id: string;
        type: string;
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: transactionIndex.url(),
    },
];

export default function TransactionsIndex({ transactions, wallets, categories, stats, filters }: PageProps) {
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isTransferSheetOpen, setIsTransferSheetOpen] = useState(false);

    const { delete: destroy } = useForm();

    const handleFiltersChange = (updates: Record<string, any>) => {
        router.get(transactionIndex.url(), {
            ...filters,
            ...updates
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const openEditSheet = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditSheetOpen(true);
    };

    const handleDelete = (transaction: Transaction) => {
        if (confirm(`Are you sure you want to delete this transaction?`)) {
            destroy(transactionDestroy.url({ transaction: transaction.id }), {
                preserveScroll: true,
            });
        }
    };

    const columns = useTransactionColumns({ openEditSheet, handleDelete });

    return (
        <>
            <Head title="Transactions" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold">Transactions</h2>
                                <p className="text-sm text-muted-foreground">Monitor and manage all your cash flows.</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button onClick={() => setIsTransferSheetOpen(true)} variant="outline" className="w-full sm:w-auto">
                                    <IconArrowsRightLeft className="mr-2 h-4 w-4" />
                                    Transfer Funds
                                </Button>
                                <Button onClick={() => setIsAddSheetOpen(true)} className="w-full sm:w-auto">
                                    <IconPlus className="mr-2 h-4 w-4" />
                                    Add Transaction
                                </Button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <CollapsibleSummary>
                            <SummaryCards stats={stats} filters={filters} />
                        </CollapsibleSummary>

                        {/* Filters */}
                        <div className="bg-card/50 p-4 border border-border/50 rounded-xl shadow-sm">
                            <FilterBar 
                                filters={filters}
                                wallets={wallets}
                                categories={categories}
                                onFiltersChange={handleFiltersChange}
                            />
                        </div>

                        {/* Data Table */}
                        <div className="flex flex-col justify-start gap-6">
                            <DataTable columns={columns} data={transactions.data} />

                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-border/40 bg-card/30 rounded-xl">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing <span className="font-medium text-foreground">{transactions.data.length}</span> of{' '}
                                    <span className="font-medium text-foreground">{transactions.total}</span> records.
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                                    <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap text-muted-foreground">
                                        Page <span className="text-foreground font-semibold px-1">{transactions.current_page}</span> of <span className="text-foreground font-semibold px-1">{transactions.last_page}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            size="icon"
                                            onClick={() => router.get(transactions.first_page_url, {}, { preserveScroll: true, preserveState: true })}
                                            disabled={transactions.current_page === 1}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            <IconChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            size="icon"
                                            onClick={() => transactions.prev_page_url && router.get(transactions.prev_page_url, {}, { preserveScroll: true, preserveState: true })}
                                            disabled={!transactions.prev_page_url}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            <IconChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            size="icon"
                                            onClick={() => transactions.next_page_url && router.get(transactions.next_page_url, {}, { preserveScroll: true, preserveState: true })}
                                            disabled={!transactions.next_page_url}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            <IconChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            size="icon"
                                            onClick={() => router.get(transactions.last_page_url, {}, { preserveScroll: true, preserveState: true })}
                                            disabled={transactions.current_page === transactions.last_page}
                                        >
                                            <span className="sr-only">Go to last page</span>
                                            <IconChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sheets */}
            <TransactionSheet 
                isOpen={isAddSheetOpen} 
                onOpenChange={setIsAddSheetOpen} 
                mode="add"
                wallets={wallets}
                categories={categories}
            />

            <TransactionSheet 
                isOpen={isEditSheetOpen} 
                onOpenChange={setIsEditSheetOpen} 
                mode="edit"
                transaction={editingTransaction}
                wallets={wallets}
                categories={categories}
            />

            <TransferSheet
                isOpen={isTransferSheetOpen}
                onOpenChange={setIsTransferSheetOpen}
                wallets={wallets}
            />
        </>
    );
}

TransactionsIndex.layout = (page: React.ReactNode) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {page}
        </AppLayout>
    );
};
