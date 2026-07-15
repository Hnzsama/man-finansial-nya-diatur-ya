import { Link } from '@inertiajs/react';
import { IconChartBar, IconArrowRight, IconAlertTriangle } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetItem {
  id: number;
  name: string;
  limit: number;
  spent: number;
  category: string | null;
  period: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export function BudgetProgress({ items }: { items: BudgetItem[] }) {
  return (
    <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconChartBar className="h-4 w-4 text-violet-500" />Budget Utilization
            </CardTitle>
            <CardDescription>Pemakaian anggaran bulan ini</CardDescription>
          </div>
          <Link
            href="/budgets"
            className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5"
          >
            Semua <IconArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">Belum ada budget aktif.</p>
        ) : (
          items.map(b => {
            const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
            const isOver = b.spent > b.limit;
            const isWarning = pct >= 80 && !isOver;
            const barColor = isOver
              ? '#F04438'
              : isWarning
              ? '#F79009'
              : '#3B5BDB';

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground/90 truncate block">{b.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{b.category ?? b.period}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(isOver || isWarning) && (
                      <IconAlertTriangle
                        className={`h-3 w-3 ${isOver ? 'text-destructive' : 'text-amber-500'}`}
                      />
                    )}
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: barColor }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="tabular-nums">{fmt(b.spent)} digunakan</span>
                  <span className="tabular-nums">dari {fmt(b.limit)}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
