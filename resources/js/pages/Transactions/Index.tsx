import { Head, router, useForm } from '@inertiajs/react';
import { IconPlus, IconArrowsRightLeft, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import React, { useState } from 'react';
import { index as transactionIndex, destroy as transactionDestroy } from '@/actions/App/Http/Controllers/TransactionController';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
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

  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

    const handleDelete = (transaction: Transaction) => {
        setDeletingTransaction(transaction);
    };

    const confirmDelete = () => {
        if (!deletingTransaction) return;
        destroy(transactionDestroy.url({ transaction: deletingTransaction.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingTransaction(null);
            }
        });
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
                            <DataTable columns={columns} data={transactions.data} pagination={transactions} />
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

            <ConfirmDialog
                open={!!deletingTransaction}
                onOpenChange={(open) => !open && setDeletingTransaction(null)}
                title="Hapus Transaksi"
                description="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={confirmDelete}
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
