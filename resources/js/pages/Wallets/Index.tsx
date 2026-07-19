import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import {
    IconPlus,
    IconLayoutColumns,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconSearch,
} from '@tabler/icons-react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import type { VisibilityState } from "@tanstack/react-table";
import React, { useState, useMemo } from 'react';

import { destroy } from '@/actions/App/Http/Controllers/WalletController';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { WalletSheet } from './components/wallet-sheet';
import { useWalletColumns } from './components/columns';

interface Wallet {
    id: number;
    name: string;
    type: 'cash' | 'bank' | 'ewallet' | 'digital';
    current_balance: number;
    opening_balance: number;
    icon?: string;
}

interface Stats {
    total_balance: number;
    cash_balance: number;
    bank_balance: number;
    ewallet_balance: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wallets',
        href: '#',
    },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function Index({ wallets, stats }: { wallets: Wallet[], stats: Stats }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState('');

    const { delete: destroyWallet } = useForm();

    const filteredWallets = useMemo(() => {
        if (!searchQuery) return wallets;
        return wallets.filter((w) => 
            w.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [wallets, searchQuery]);

    const openEdit = (wallet: Wallet) => {
        setEditingWallet(wallet);
    };

    const [deletingWalletId, setDeletingWalletId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeletingWalletId(id);
    };

    const confirmDelete = () => {
        if (!deletingWalletId) return;
        destroyWallet(destroy.url(deletingWalletId), {
            onSuccess: () => {
                setDeletingWalletId(null);
            }
        });
    };

    const columns = useWalletColumns({ openEdit, handleDelete });

    const table = useReactTable({
        data: filteredWallets,
        columns,
        state: { columnVisibility, rowSelection, pagination },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <>
            <Head title="Wallets" />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                    
                    {/* Header Actions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Wallets</h1>
                            <p className="text-muted-foreground">Manage your accounts and balances.</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <CollapsibleSummary>
                        <SummaryCards stats={stats} formatCurrency={formatCurrency} />
                    </CollapsibleSummary>

                    {/* Rich Data Table Section */}
                    <div className="flex flex-col justify-start gap-6 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold tracking-tight">Connected Accounts</h2>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-60">
                                    <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search wallets..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-card h-9 w-full"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-9 flex-1 sm:flex-initial justify-center gap-1.5">
                                                <IconLayoutColumns className="h-4 w-4" />
                                                <span>Columns</span>
                                                <IconChevronDown className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            {table.getAllColumns().filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide()).map((c) => (
                                                <DropdownMenuCheckboxItem key={c.id} className="capitalize" checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)}>
                                                    {c.id}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    
                                    <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-9 flex-1 sm:flex-initial justify-center gap-1.5">
                                        <IconPlus className="h-4 w-4" />
                                        <span>Add Wallet</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-xs">
                            <div className="overflow-x-auto w-full">
                                <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((hg) => (
                                        <TableRow key={hg.id}>
                                            {hg.headers.map((h) => (
                                                <TableHead key={h.id}>
                                                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                                No wallets found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-border/40 bg-card/30">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
                                        <select
                                            className="h-8 w-[70px] rounded-md border border-input bg-card text-xs outline-none"
                                            value={table.getState().pagination.pageSize}
                                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                                        >
                                            {[10, 20, 30, 40, 50].map((ps) => (
                                                <option key={ps} value={ps}>{ps}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
                                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                                            <span className="sr-only">Go to first page</span><IconChevronsLeft />
                                        </Button>
                                        <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                            <span className="sr-only">Go to previous page</span><IconChevronLeft />
                                        </Button>
                                        <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                            <span className="sr-only">Go to next page</span><IconChevronRight />
                                        </Button>
                                        <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                                            <span className="sr-only">Go to last page</span><IconChevronsRight />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Sheets */}
            <WalletSheet
                isOpen={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                mode="add"
            />

            <WalletSheet
                isOpen={!!editingWallet}
                onOpenChange={(open) => !open && setEditingWallet(null)}
                mode="edit"
                wallet={editingWallet}
            />

            <ConfirmDialog
                open={!!deletingWalletId}
                onOpenChange={(open) => !open && setDeletingWalletId(null)}
                title="Hapus Dompet"
                description="Apakah Anda yakin ingin menghapus dompet ini? Semua transaksi yang terkait dengan dompet ini juga akan terhapus."
                onConfirm={confirmDelete}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>
        {page}
    </AppLayout>
);
