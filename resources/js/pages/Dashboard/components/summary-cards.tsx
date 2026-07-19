import React from 'react';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCash,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Stats {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  net_flow: number;
  income_change: number;
  expense_change: number;
  net_flow_change: number;
}

interface SummaryCardsProps {
  stats: Stats;
}

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue);
};

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Balance (Wallets)</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">{formatCurrency(stats.total_balance)}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCash className="size-4" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Total funds collected</div>
          <div className="text-muted-foreground">Combined balance of all wallets</div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Income This Month</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl text-green-600 dark:text-green-400">{formatCurrency(stats.monthly_income)}</CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              {stats.income_change >= 0 ? <IconTrendingUp className="text-green-600" /> : <IconTrendingDown className="text-destructive" />}
              {stats.income_change >= 0 ? '+' : ''}{stats.income_change}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.income_change >= 0 ? 'Increased from last month' : 'Decreased from last month'}
          </div>
          <div className="text-muted-foreground">Total money in this month (excludes Transfer Funds)</div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Expenses This Month</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl text-destructive">{formatCurrency(stats.monthly_expense)}</CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              {stats.expense_change >= 0 ? <IconTrendingUp className="text-destructive" /> : <IconTrendingDown className="text-green-600" />}
              {stats.expense_change >= 0 ? '+' : ''}{stats.expense_change}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.expense_change >= 0 ? 'Increased from last month' : 'Decreased from last month'}
          </div>
          <div className="text-muted-foreground">Total money out this month (excludes Transfer Funds)</div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Net Cash Flow</CardDescription>
          <CardTitle className={`text-xl font-semibold tabular-nums @[250px]/card:text-2xl ${stats.net_flow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {formatCurrency(stats.net_flow)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              {stats.net_flow >= 0 ? <IconArrowUpRight className="text-green-600" /> : <IconArrowDownRight className="text-destructive" />}
              {stats.net_flow_change >= 0 ? '+' : ''}{stats.net_flow_change}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.net_flow >= 0 ? 'Surplus this month' : 'Deficit this month'}
          </div>
          <div className="text-muted-foreground">Net cash flow for this month (excludes Transfer Funds)</div>
        </CardFooter>
      </Card>
    </div>
  );
}
export { formatCurrency };
