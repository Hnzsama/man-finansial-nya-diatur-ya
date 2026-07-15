import { IconArrowUpRight, IconArrowDownLeft, IconWallet } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function SummaryCards({ totalIncome, totalExpense, netSavings }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Income</CardTitle>
          <IconArrowDownLeft className="h-4.5 w-4.5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-primary tabular-nums">{formatCurrency(totalIncome)}</div>
          <p className="text-[10px] text-muted-foreground font-light mt-1">Cumulative cash flow additions</p>
        </CardContent>
      </Card>

      <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Expenses</CardTitle>
          <IconArrowUpRight className="h-4.5 w-4.5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-destructive tabular-nums">{formatCurrency(totalExpense)}</div>
          <p className="text-[10px] text-muted-foreground font-light mt-1">Cumulative ledger expenses</p>
        </CardContent>
      </Card>

      <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Cash Flow</CardTitle>
          <IconWallet className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className={`text-lg font-bold tabular-nums ${netSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {formatCurrency(netSavings)}
          </div>
          <p className="text-[10px] text-muted-foreground font-light mt-1">Surplus balance margins</p>
        </CardContent>
      </Card>
    </div>
  );
}
