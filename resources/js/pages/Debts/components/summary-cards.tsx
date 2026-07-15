import React from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Stats {
  total_payable: number;
  total_receivable: number;
  total_paid_off: number;
  overdue_debts: number;
}

interface SummaryCardsProps {
  stats: Stats;
  formatCurrency: (value: number | string) => string;
}

export function SummaryCards({ stats, formatCurrency }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardDescription>My Debts (Payable)</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-orange-500">{formatCurrency(stats.total_payable)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Total remaining debts to be settled
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>My Loans (Receivable)</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-emerald-500">{formatCurrency(stats.total_receivable)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Total money lent to others
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Total Paid Off</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-blue-500">{formatCurrency(stats.total_paid_off)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Accumulated installment payments settled
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Overdue Loans</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-destructive">
            {stats.overdue_debts} <span className="text-sm font-normal text-muted-foreground">contacts</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Active loans past their due date
        </CardFooter>
      </Card>
    </div>
  );
}
