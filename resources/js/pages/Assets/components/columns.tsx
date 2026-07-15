import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Asset {
  id: number;
  name: string;
  type: 'savings' | 'deposit' | 'gold' | 'stock' | 'crypto' | 'property';
  current_value: number | string;
  notes: string | null;
}

interface AssetsColumnsProps {
  onEdit: (asset: Asset) => void;
  formatCurrency: (value: number | string) => string;
}

const typeMap: Record<string, string> = {
  savings: 'Savings Account',
  deposit: 'Time Deposit',
  gold: 'Gold & Metals',
  stock: 'Stocks',
  crypto: 'Cryptocurrency',
  property: 'Property / Land',
};

export const useAssetColumns = ({ onEdit, formatCurrency }: AssetsColumnsProps): ColumnDef<Asset>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Asset Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return <span className="capitalize">{typeMap[type] || type}</span>;
      },
    },
    {
      accessorKey: 'current_value',
      header: () => <div className="text-right">Current Value</div>,
      cell: ({ row }) => {
        const value = row.original.current_value;
        return (
          <div className="text-right font-medium tabular-nums text-primary">
            {formatCurrency(value)}
          </div>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm max-w-[200px] truncate block">
          {row.original.notes || '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const asset = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(asset)}>
                Edit Asset Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
