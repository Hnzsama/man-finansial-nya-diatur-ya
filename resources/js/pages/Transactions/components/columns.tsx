import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import type {ColumnDef} from '@tanstack/react-table';
import { format } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Transaction } from '@/types';

// Helper to render dynamic Lucide Icon safely
const DynamicIcon = ({ name, className }: { name?: string | null; className?: string }) => {
    if (!name) {
        return <LucideIcons.Folder className={className} />;
    }

    const IconComponent = (LucideIcons as any)[name];

    if (!IconComponent) {
        return <LucideIcons.Folder className={className} />;
    }

    return <IconComponent className={className} />;
};

interface TransactionColumnActions {
    openEditSheet: (transaction: Transaction) => void;
    handleDelete: (transaction: Transaction) => void;
}

export const useTransactionColumns = ({ openEditSheet, handleDelete }: TransactionColumnActions) => {
    return useMemo<ColumnDef<Transaction>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                return <div className="font-medium whitespace-nowrap">{format(new Date(row.original.date), 'dd MMM yyyy')}</div>;
            },
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const category = row.original.category;

                if (!category) {
                    return <span className="text-muted-foreground">-</span>;
                }

                return (
                    <div className="flex items-center gap-2 font-medium">
                        <div className="p-2 rounded-lg bg-primary/10" style={{ color: category.color || 'inherit' }}>
                            <DynamicIcon name={category.icon} className="w-4 h-4" />
                        </div>
                        {category.name}
                    </div>
                );
            },
        },
        {
            accessorKey: "wallet",
            header: "Wallet",
            cell: ({ row }) => {
                return <div>{row.original.wallet?.name}</div>;
            },
        },
        {
            accessorKey: "notes",
            header: "Notes",
            cell: ({ row }) => {
                return <div className="text-muted-foreground max-w-[200px] truncate" title={row.original.notes || ''}>{row.original.notes || '-'}</div>;
            },
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right">Amount</div>,
            cell: ({ row }) => {
                const amount = parseFloat(row.original.amount);
                const isIncome = row.original.type === 'income';
                
                return (
                    <div className={`text-right font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}Rp {amount.toLocaleString('id-ID')}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const transaction = row.original;

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <IconDotsVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditSheet(transaction)}>
                                    <IconEdit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(transaction)}>
                                    <IconTrash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], [openEditSheet, handleDelete]);
};
