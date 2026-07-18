import React from 'react';
import type { ColumnDef } from "@tanstack/react-table";
import {
  IconDotsVertical,
  IconEdit,
  IconCoins,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { processPayment as subPayment, update as subUpdate } from '@/actions/App/Http/Controllers/SubscriptionController';

interface Wallet {
  id: number;
  name: string;
  current_balance: number | string;
}

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

interface Subscription {
  id: number;
  wallet_id: number;
  category_id: number | null;
  name: string;
  amount: number | string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_billing_date: string;
  is_active: boolean;
  notes: string | null;
  wallet?: Wallet;
  category?: Category | null;
}

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue);
};

export const getColumns = (
  onEdit: (sub: Subscription) => void
): ColumnDef<Subscription>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-semibold">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium tabular-nums text-red-600 dark:text-red-400">
        {formatCurrency(row.original.amount)}
      </div>
    ),
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.frequency}
      </Badge>
    ),
  },
  {
    accessorKey: "next_billing_date",
    header: "Next Billing",
    cell: ({ row }) => {
      const date = new Date(row.original.next_billing_date);
      const isOverdue = date < new Date();
      return (
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${isOverdue && row.original.is_active ? 'text-destructive font-semibold animate-pulse' : ''}`}>
          <IconClock className="h-3.5 w-3.5" />
          {date.toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      );
    },
  },
  {
    accessorKey: "wallet",
    header: "Wallet",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm font-medium">
        {row.original.wallet?.name || '-'}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm font-medium">
        {row.original.category?.name || '-'}
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      const handleToggle = () => {
        router.patch(
          subUpdate.url(row.original.id),
          {
            name: row.original.name,
            amount: row.original.amount,
            frequency: row.original.frequency,
            next_billing_date: row.original.next_billing_date.split('T')[0],
            wallet_id: row.original.wallet_id,
            category_id: row.original.category_id,
            is_active: !active,
            notes: row.original.notes,
          },
          {
            preserveScroll: true,
            onSuccess: () => toast.success(`Subscription successfully ${!active ? 'activated' : 'paused'}.`)
          }
        );
      };

      return (
        <button
          onClick={handleToggle}
          type="button"
          className={`cursor-pointer inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border transition-colors ${active ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30' : 'bg-muted text-muted-foreground border-border'}`}
        >
          {active ? 'Active' : 'Paused'}
        </button>
      );
    },
  },
  {
    id: "pay_action",
    cell: ({ row }) => {
      const active = row.original.is_active;
      const handlePay = () => {
        if (confirm(`Do you want to process recurring payment for subscription "${row.original.name}" now early?`)) {
          router.post(
            subPayment.url(row.original.id),
            {},
            {
              preserveScroll: true,
              onSuccess: () => toast.success("Recurring payment processed successfully.")
            }
          );
        }
      };

      return (
        <Button
          size="sm"
          variant="outline"
          onClick={handlePay}
          disabled={!active}
          className="h-8 text-xs font-medium gap-1"
        >
          <IconCoins className="h-3.5 w-3.5 text-orange-500" />
          Process Payment
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/80">
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <IconEdit className="mr-2 h-4 w-4" /> Edit Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
