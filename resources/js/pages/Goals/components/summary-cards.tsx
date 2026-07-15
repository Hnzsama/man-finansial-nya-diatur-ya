import React from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SummaryCardsProps {
  totalTarget: number;
  totalTerkumpul: number;
  totalSisa: number;
  goalsAchieved: number;
  totalGoalsCount: number;
  formatCurrency: (value: number | string) => string;
}

export function SummaryCards({
  totalTarget,
  totalTerkumpul,
  totalSisa,
  goalsAchieved,
  totalGoalsCount,
  formatCurrency,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardDescription>Total Goal Target</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums">{formatCurrency(totalTarget)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Total target of all savings goals
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Saved Amount</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(totalTerkumpul)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Accumulated saved savings
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Remaining Amount</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-destructive">{formatCurrency(totalSisa)}</CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Remaining balance needed to save
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Goals Achieved</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
            {goalsAchieved} <span className="text-sm font-normal text-muted-foreground">/ {totalGoalsCount} goals</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Savings goals successfully completed
        </CardFooter>
      </Card>
    </div>
  );
}
