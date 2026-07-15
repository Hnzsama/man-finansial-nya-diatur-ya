import React from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Counts {
  savings: number;
  deposit: number;
  gold: number;
  stock: number;
  crypto: number;
  property: number;
}

interface SummaryCardsProps {
  totalValue: number;
  counts: Counts;
  formatCurrency: (value: number | string) => string;
}

export function SummaryCards({ totalValue, counts, formatCurrency }: SummaryCardsProps) {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardDescription>Total Assets Value</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-primary">
            {formatCurrency(totalValue)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Accumulated net worth calculation
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Paper Investments</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
            {counts.stock + counts.crypto} <span className="text-sm font-normal text-muted-foreground">items</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Stocks: {counts.stock} | Crypto: {counts.crypto}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Liquid & Hard Assets</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-orange-500">
            {counts.savings + counts.deposit + counts.gold} <span className="text-sm font-normal text-muted-foreground">items</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Savings/Deposit: {counts.savings + counts.deposit} | Gold: {counts.gold}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Real Estate / Property</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
            {counts.property} <span className="text-sm font-normal text-muted-foreground">items</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Fixed property assets registered
        </CardFooter>
      </Card>
    </div>
  );
}
