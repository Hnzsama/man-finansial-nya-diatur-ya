import { Head, router } from '@inertiajs/react';
import {
  IconPlus,
  IconSearch,
  IconRepeat,
} from '@tabler/icons-react';
import * as LucideIcons from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table";
import { index as subscriptionIndex, processPayment as subPayment } from '@/actions/App/Http/Controllers/SubscriptionController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { SubscriptionSheet } from './components/subscription-sheet';
import { getColumns } from './components/columns';

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

interface PageProps {
  subscriptions: Subscription[];
  wallets: Wallet[];
  categories: Category[];
  stats: {
    total_monthly_cost: number;
    active_subscriptions: number;
    due_this_week: number;
    inactive_subscriptions: number;
  };
  error?: string;
  success?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Subscriptions',
    href: subscriptionIndex.url(),
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

export default function SubscriptionsIndex({ subscriptions, wallets, categories, stats }: PageProps) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery) return subscriptions;
    const q = searchQuery.toLowerCase();
    return subscriptions.filter((s) => 
      s.name.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
  }, [subscriptions, searchQuery]);

  const openAddSheet = () => {
    setIsAddSheetOpen(true);
  };

  const openEditSheet = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsEditSheetOpen(true);
  };

  const [payingSubscription, setPayingSubscription] = useState<Subscription | null>(null);

  const handlePayEarly = (sub: Subscription) => {
    setPayingSubscription(sub);
  };

  const confirmPayEarly = () => {
    if (!payingSubscription) return;
    router.post(
      subPayment.url(payingSubscription.id),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setPayingSubscription(null);
          toast.success("Recurring payment processed successfully.");
        }
      }
    );
  };

  const columns = useMemo(() => getColumns(openEditSheet, handlePayEarly), []);

  const table = useReactTable({
    data: filteredSubscriptions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <Head title="Subscriptions" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Recurring Bills & Subscriptions</h1>
                <p className="text-sm text-muted-foreground">Monitor and automate recurring payment services.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card h-9"
                  />
                </div>
                <Button onClick={openAddSheet} size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Subscription
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <CollapsibleSummary>
              <SummaryCards stats={stats} formatCurrency={formatCurrency} />
            </CollapsibleSummary>

            {/* Subscriptions List */}
            {filteredSubscriptions.length > 0 ? (
              <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/80">
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
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card">
                <IconRepeat className="h-12 w-12 text-muted-foreground/50 mb-3 animate-pulse" />
                <h3 className="font-semibold text-lg">No Subscriptions Found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
                  Add recurring billing items like Netflix, electricity bills, or hosting to track monthly expenses.
                </p>
                <Button onClick={openAddSheet}>Add Your First Subscription</Button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Sheets */}
      <SubscriptionSheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        mode="add"
        wallets={wallets}
        categories={categories}
        formatCurrency={formatCurrency}
      />

      <SubscriptionSheet
        isOpen={isEditSheetOpen}
        onOpenChange={(open) => {
          setIsEditSheetOpen(open);
          if (!open) setSelectedSubscription(null);
        }}
        mode="edit"
        subscription={selectedSubscription}
        wallets={wallets}
        categories={categories}
        formatCurrency={formatCurrency}
      />

      <ConfirmDialog
        open={!!payingSubscription}
        onOpenChange={(open) => !open && setPayingSubscription(null)}
        title="Proses Pembayaran Berulang"
        description={payingSubscription ? `Apakah Anda yakin ingin memproses pembayaran berulang untuk langganan "${payingSubscription.name}" lebih awal saat ini?` : ''}
        onConfirm={confirmPayEarly}
        variant="default"
        confirmText="Proses"
      />
    </>
  );
}

SubscriptionsIndex.layout = (page: React.ReactNode) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {page}
    </AppLayout>
  );
};
