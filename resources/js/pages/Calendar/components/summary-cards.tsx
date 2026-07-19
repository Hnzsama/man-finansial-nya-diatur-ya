import React, { useMemo } from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number | string;
  date: string;
  category?: { name: string };
}

interface Goal {
  id: number;
  name: string;
  target_amount: number | string;
  deadline: string;
}

interface Debt {
  id: number;
  type: 'payable' | 'receivable';
  amount: number | string;
  due_date: string;
}

interface Subscription {
  id: number;
  name: string;
  amount: number | string;
  next_billing_date: string;
}

interface SummaryCardsProps {
  currentMonth: number; // 0-indexed (0 = January)
  currentYear: number;
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  subscriptions: Subscription[];
  formatCurrency: (value: number | string) => string;
}

export function SummaryCards({
  currentMonth,
  currentYear,
  transactions,
  goals,
  debts,
  subscriptions,
  formatCurrency,
}: SummaryCardsProps) {
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let dueDebtsCount = 0;
    let dueSubCost = 0;

    // Filter transactions in visible month (excluding Transfer Fund)
    transactions.forEach((tx) => {
      if (tx.category?.name === 'Transfer Fund') return;
      
      const date = new Date(tx.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        if (tx.type === 'income') {
          income += amt;
        } else {
          expense += amt;
        }
      }
    });

    // Filter active debts in visible month
    debts.forEach((d) => {
      const date = new Date(d.due_date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        dueDebtsCount++;
      }
    });

    // Filter subscriptions billed in visible month
    subscriptions.forEach((sub) => {
      const date = new Date(sub.next_billing_date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const amt = typeof sub.amount === 'string' ? parseFloat(sub.amount) : sub.amount;
        dueSubCost += amt;
      }
    });

    return { income, expense, dueDebtsCount, dueSubCost };
  }, [currentMonth, currentYear, transactions, debts, subscriptions]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardDescription>Income ({monthNames[currentMonth]})</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
            {formatCurrency(stats.income)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Received in this calendar view month (excludes Transfer Funds)
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Expenses ({monthNames[currentMonth]})</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-destructive">
            {formatCurrency(stats.expense)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Spent in this calendar view month (excludes Transfer Funds)
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Subscription Dues</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-orange-500">
            {formatCurrency(stats.dueSubCost)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Upcoming subscription renewals this month
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Due Debts / Loans</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
            {stats.dueDebtsCount} <span className="text-sm font-normal text-muted-foreground">deadlines</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Active debts requiring payment this month
        </CardFooter>
      </Card>
    </div>
  );
}
