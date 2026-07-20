import { Head } from '@inertiajs/react';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconCoins,
  IconAlertTriangle,
  IconFileText,
  IconSearch,
} from '@tabler/icons-react';
import React, { useState } from 'react';

import { index as debtIndex } from '@/actions/App/Http/Controllers/DebtController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { DebtSheet } from './components/debt-sheet';
import { RepaymentSheet } from './components/repayment-sheet';

interface Debt {
  id: number;
  type: 'payable' | 'receivable';
  counterparty_name: string;
  amount: number | string;
  remaining_amount: number | string;
  due_date: string | null;
  notes: string | null;
  status: 'active' | 'paid_off' | 'cancelled';
  progress: number;
  created_at: string;
}

interface Wallet {
  id: number;
  name: string;
  current_balance: number | string;
}

interface PageProps {
  debts: Debt[];
  stats: {
    total_payable: number;
    total_receivable: number;
    total_paid_off: number;
    overdue_debts: number;
  };
  wallets: Wallet[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Debts & Loans',
    href: debtIndex.url(),
  },
];

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const hasDecimals = numericValue % 1 !== 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(dateString));
};

export default function DebtsIndex({ debts, stats, wallets }: PageProps) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDebts = React.useMemo(() => {
    if (!searchQuery) return debts;
    const query = searchQuery.toLowerCase();
    return debts.filter((d) => 
      d.counterparty_name.toLowerCase().includes(query) ||
      (d.notes && d.notes.toLowerCase().includes(query))
    );
  }, [debts, searchQuery]);

  const activePayables = filteredDebts.filter((d) => d.type === 'payable' && d.status === 'active');
  const activeReceivables = filteredDebts.filter((d) => d.type === 'receivable' && d.status === 'active');
  const settledDebts = filteredDebts.filter((d) => d.status === 'paid_off' || d.status === 'cancelled');

  const openAddSheet = () => {
    setIsAddSheetOpen(true);
  };

  const openEditSheet = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsEditSheetOpen(true);
  };

  const openPaymentSheet = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentSheetOpen(true);
  };

  const renderDebtCards = (items: Debt[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-muted-foreground">
          <IconCheck className="h-10 w-10 text-muted-foreground/45 mb-2.5 animate-pulse" />
          <h3 className="font-semibold text-base text-foreground">All Clear!</h3>
          <p className="text-xs mt-1 text-center max-w-xs">No loan records match this filter or search query.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((debt) => {
          const isPayable = debt.type === 'payable';
          const isSettled = debt.status === 'paid_off';
          
          const themeColor = isPayable ? '#f97316' : '#10b981';
          const isOverdue = debt.due_date && new Date(debt.due_date) < new Date() && !isSettled;

          return (
            <Card
              key={debt.id}
              className="group relative overflow-hidden rounded-xl border border-border/40 bg-card hover:bg-card/90 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--shadow-color)] hover:-translate-y-0.5 flex flex-col h-full"
              style={{ '--shadow-color': `${themeColor}15` } as React.CSSProperties}
            >
              {/* Ambient Background Glow */}
              <div 
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: themeColor }}
              />

              <CardHeader className="flex flex-row items-start justify-between pb-2 gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base tracking-tight truncate max-w-full block" title={debt.counterparty_name}>
                      {debt.counterparty_name}
                    </span>
                    <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0 shrink-0">
                      {debt.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Due Date: {formatDate(debt.due_date)}</span>
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/85 shrink-0">
                      <IconDotsVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditSheet(debt)}>
                      <IconEdit className="mr-2 h-4 w-4" /> Edit Record
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="pt-2 pb-4 space-y-4 flex-1 flex flex-col justify-between">
                {/* Progress bar */}
                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Paid Percentage</span>
                    <span style={{ color: themeColor }}>{debt.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${debt.progress}%`,
                        backgroundColor: themeColor,
                        boxShadow: `0 0 8px ${themeColor}40`,
                      }}
                    />
                  </div>
                </div>

                {/* Amount details */}
                <div className="flex flex-row justify-between items-center gap-2 flex-wrap pt-1 w-full text-xs">
                  <div className="min-w-0 flex-1">
                    <span className="text-muted-foreground block text-[10px]">Remaining</span>
                    <span className="text-sm font-semibold tabular-nums text-foreground/95 truncate block">
                      {formatCurrency(debt.remaining_amount)}
                    </span>
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <span className="text-muted-foreground block text-[10px]">Initial Total</span>
                    <span className="text-sm font-semibold tabular-nums truncate block">
                      {formatCurrency(debt.amount)}
                    </span>
                  </div>
                </div>

                {/* Notes if exist */}
                {debt.notes && (
                  <div className="text-xs p-2.5 rounded-lg bg-muted/20 border border-border/20 text-muted-foreground flex gap-1.5 items-start w-full">
                    <IconFileText className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{debt.notes}</span>
                  </div>
                )}
              </CardContent>

              {!isSettled && (
                <CardFooter className="bg-muted/10 border-t border-border/30 py-3 text-xs flex flex-row flex-wrap gap-2 justify-between items-center">
                  {isOverdue ? (
                    <Badge variant="destructive" className="font-semibold gap-1 text-[10px] py-0.5 shrink-0">
                      <IconAlertTriangle className="h-3 w-3" /> Overdue
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/60 shrink-0">Active</span>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={() => openPaymentSheet(debt)}
                    className="h-8 text-xs font-medium gap-1 shrink-0"
                    style={{ backgroundColor: themeColor, color: '#fff' }}
                  >
                    <IconCoins className="h-3.5 w-3.5" />
                    {isPayable ? 'Pay' : 'Receive'}
                  </Button>
                </CardFooter>
              )}

              {isSettled && (
                <CardFooter className="bg-muted/10 border-t border-border/30 py-3 text-xs flex flex-row flex-wrap gap-2 justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1 text-green-500 font-semibold shrink-0">
                    <IconCheck className="h-4 w-4" /> Settled / Paid Off
                  </span>
                  <span className="text-xs text-muted-foreground/60 capitalize shrink-0">
                    {debt.status.replace('_', ' ')}
                  </span>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Head title="Debts & Loans" />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Debts & Loans</h1>
                <p className="text-sm text-muted-foreground">Manage external debts and loans, and track payment installments periodically.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search loans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card h-9"
                  />
                </div>
                <Button onClick={openAddSheet} size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Record New Loan
                </Button>
              </div>
            </div>

            {/* Statistics Row */}
            <CollapsibleSummary>
              <SummaryCards stats={stats} formatCurrency={formatCurrency} />
            </CollapsibleSummary>

            {/* Tabs List */}
            <Tabs defaultValue="payable" className="w-full">
              <div className="w-full overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="bg-muted flex w-max sm:w-fit">
                  <TabsTrigger value="payable" className="gap-2">
                    <IconTrendingDown className="h-4 w-4 text-orange-500" />
                    My Debts ({activePayables.length})
                  </TabsTrigger>
                  <TabsTrigger value="receivable" className="gap-2">
                    <IconTrendingUp className="h-4 w-4 text-emerald-500" />
                    My Loans ({activeReceivables.length})
                  </TabsTrigger>
                  <TabsTrigger value="settled" className="gap-2">
                    <IconCheck className="h-4 w-4 text-blue-500" />
                    Settled History ({settledDebts.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="payable" className="mt-6 space-y-4">
                {renderDebtCards(activePayables)}
              </TabsContent>

              <TabsContent value="receivable" className="mt-6 space-y-4">
                {renderDebtCards(activeReceivables)}
              </TabsContent>

              <TabsContent value="settled" className="mt-6 space-y-4">
                {renderDebtCards(settledDebts)}
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </div>

      {/* Sheets */}
      <DebtSheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        mode="add"
        wallets={wallets}
        formatCurrency={formatCurrency}
      />

      <DebtSheet
        isOpen={isEditSheetOpen}
        onOpenChange={(open) => {
          setIsEditSheetOpen(open);
          if (!open) setSelectedDebt(null);
        }}
        mode="edit"
        debt={selectedDebt}
        wallets={wallets}
        formatCurrency={formatCurrency}
      />

      <RepaymentSheet
        isOpen={isPaymentSheetOpen}
        onOpenChange={(open) => {
          setIsPaymentSheetOpen(open);
          if (!open) setSelectedDebt(null);
        }}
        debt={selectedDebt}
        wallets={wallets}
        formatCurrency={formatCurrency}
      />
    </>
  );
}

DebtsIndex.layout = (page: React.ReactNode) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {page}
    </AppLayout>
  );
};
