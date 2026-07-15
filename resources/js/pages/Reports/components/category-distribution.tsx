import { IconCategory } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Item { category: string; value: string | number; }

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function CategoryDistribution({ items }: { items: Item[] }) {
  const total = items.reduce((a, c) => a + (typeof c.value === 'string' ? parseFloat(c.value) : c.value), 0);

  return (
    <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <IconCategory className="h-4.5 w-4.5 text-primary" />
          Spending by Categories
        </CardTitle>
        <CardDescription>Expense distribution break-down</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No category data logged.</p>
        ) : (
          items.map(item => {
            const val = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
            const pct = total > 0 ? (val / total) * 100 : 0;
            return (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground/90">{item.category}</span>
                  <span className="text-muted-foreground tabular-nums">{formatCurrency(val)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                  <div className="h-full bg-destructive/60 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
