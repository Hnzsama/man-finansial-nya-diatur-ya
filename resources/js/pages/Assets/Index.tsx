import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as assetIndex } from '@/actions/App/Http/Controllers/AssetController';
import { SummaryCards } from './components/summary-cards';
import { AssetSheet } from './components/asset-sheet';
import { useAssetColumns } from './components/columns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

interface Asset {
  id: number;
  name: string;
  type: 'savings' | 'deposit' | 'gold' | 'stock' | 'crypto' | 'property';
  current_value: number | string;
  notes: string | null;
}

interface PageProps {
  assets: Asset[];
  stats: {
    total_value: number;
    counts: {
      savings: number;
      deposit: number;
      gold: number;
      stock: number;
      crypto: number;
      property: number;
    };
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Assets',
    href: assetIndex.url(),
  },
];

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue);
};

export default function AssetsIndex({ assets, stats }: PageProps) {
  const [search, setSearch] = useState('');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const filteredAssets = useMemo(() => {
    if (!search.trim()) return assets;
    const query = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query) ||
        (a.notes && a.notes.toLowerCase().includes(query))
    );
  }, [assets, search]);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsEditSheetOpen(true);
  };

  const columns = useAssetColumns({ onEdit: handleEdit, formatCurrency });

  const table = useReactTable({
    data: filteredAssets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <Head title="Asset Management" />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Assets & Wealth</h2>
                <p className="text-sm text-muted-foreground font-light">
                  Track and monitor all your physical & financial holdings to view total net worth.
                </p>
              </div>

              <Button onClick={() => setIsAddSheetOpen(true)} className="w-full sm:w-auto">
                <IconPlus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </div>

            {/* Summary Cards */}
            <SummaryCards
              totalValue={stats.total_value}
              counts={stats.counts}
              formatCurrency={formatCurrency}
            />

            {/* Local Filter Bar */}
            <div className="bg-card/50 p-4 border border-border/50 rounded-xl shadow-sm">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assets by name or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex flex-col justify-start gap-6">
              <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50 shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-muted/50 border-border/50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-32 text-center text-muted-foreground"
                        >
                          No assets registered. Add an asset to start tracking!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Showing <span className="font-medium text-foreground">{filteredAssets.length}</span> of{' '}
                  <span className="font-medium text-foreground">{assets.length}</span> assets.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <AssetSheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        mode="add"
      />

      <AssetSheet
        isOpen={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        mode="edit"
        asset={editingAsset}
      />
    </>
  );
}

AssetsIndex.layout = (page: React.ReactNode) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {page}
    </AppLayout>
  );
};
