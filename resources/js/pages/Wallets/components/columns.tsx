import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconCash,
    IconBuildingBank,
    IconDeviceMobile,
    IconWallet
} from '@tabler/icons-react';
import {
    Wallet as LucideWallet,
    Landmark,
    CreditCard,
    Banknote,
    Coins,
    PiggyBank,
    Smartphone,
    Bitcoin,
    Activity,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Wallet {
    id: number;
    name: string;
    type: 'cash' | 'bank' | 'ewallet' | 'digital';
    current_balance: number;
    opening_balance: number;
    icon?: string;
}

const WALLET_ICONS = {
    'Wallet': LucideWallet,
    'Landmark': Landmark,
    'CreditCard': CreditCard,
    'Banknote': Banknote,
    'Coins': Coins,
    'PiggyBank': PiggyBank,
    'Smartphone': Smartphone,
    'Bitcoin': Bitcoin,
    'Activity': Activity,
    'Briefcase': Briefcase,
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const getTypeIcon = (wallet: Wallet) => {
    if (wallet.icon && WALLET_ICONS[wallet.icon as keyof typeof WALLET_ICONS]) {
        const Icon = WALLET_ICONS[wallet.icon as keyof typeof WALLET_ICONS];
        return <Icon className="h-4 w-4" />;
    }

    switch (wallet.type) {
        case 'cash': return <IconCash className="h-4 w-4" />;
        case 'bank': return <IconBuildingBank className="h-4 w-4" />;
        case 'ewallet': return <IconDeviceMobile className="h-4 w-4" />;
        default: return <IconWallet className="h-4 w-4" />;
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'cash': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'bank': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'ewallet': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

interface UseWalletColumnsProps {
    openEdit: (wallet: Wallet) => void;
    handleDelete: (id: number) => void;
}

export function useWalletColumns({ openEdit, handleDelete }: UseWalletColumnsProps): ColumnDef<Wallet>[] {
    return React.useMemo<ColumnDef<Wallet>[]>(() => [
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
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const wallet = row.original;
                return (
                    <div className="flex items-center gap-2 font-medium">
                        <div className={`p-2 rounded-lg ${getTypeColor(wallet.type)}`}>
                            {getTypeIcon(wallet)}
                        </div>
                        {wallet.name}
                    </div>
                );
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize px-1.5 text-muted-foreground">
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: "current_balance",
            header: () => <div className="text-right w-full">Balance</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium">
                    {formatCurrency(row.original.current_balance)}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const wallet = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
                                    <IconDotsVertical />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={() => openEdit(wallet)}>
                                    <IconEdit className="mr-2 size-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDelete(wallet.id)}
                                >
                                    <IconTrash className="mr-2 size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ], [openEdit, handleDelete]);
}
export { WALLET_ICONS, getTypeColor, getTypeIcon };
