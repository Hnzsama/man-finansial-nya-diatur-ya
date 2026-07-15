import React from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Stats {
  total_monthly_cost: number;
  active_subscriptions: number;
  due_this_week: number;
  inactive_subscriptions: number;
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
          <CardDescription>Total Monthly Cost</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-primary">
            {formatCurrency(stats.total_monthly_cost)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Normalized monthly cost projection
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Active Subscriptions</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
            {stats.active_subscriptions} <span className="text-sm font-normal text-muted-foreground">active</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Currently active recurring bills
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Due This Week</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-orange-500">
            {stats.due_this_week} <span className="text-sm font-normal text-muted-foreground">bills</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Bills due within next 7 days
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardDescription>Inactive Subscriptions</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-muted-foreground">
            {stats.inactive_subscriptions} <span className="text-sm font-normal text-muted-foreground">paused</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Paused or inactive recurring bills
        </CardFooter>
      </Card>
    </div>
  );
}
