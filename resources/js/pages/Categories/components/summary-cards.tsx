import React from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Stats {
  total_budgeted: number;
  total_spent: number;
  total_budget_remaining: number;
  exceeded_budgets: number;
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
          <CardDescription>Total Budget Limit</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-primary">{formatCurrency(stats.total_budgeted)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Accumulated monthly budget limits
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Total Spent</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">{formatCurrency(stats.total_spent)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Current spending on budgeted categories
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Remaining Budget</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(stats.total_budget_remaining)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Remaining safe-to-spend budget limit
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Exceeded Budgets</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-destructive">
            {stats.exceeded_budgets} <span className="text-sm font-normal text-muted-foreground">categories</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Budgets that have exceeded their limits
        </CardFooter>
      </Card>
    </div>
  );
}
