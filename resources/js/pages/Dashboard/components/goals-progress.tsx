import { Link } from '@inertiajs/react';
import { IconTarget, IconArrowRight } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GoalItem {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  deadline: string | null;
  color: string | null;
  icon: string | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const GOAL_COLORS = ['#3B5BDB', '#12B76A', '#F79009', '#9B8AFB'];

export function GoalsProgress({ items }: { items: GoalItem[] }) {
  return (
    <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconTarget className="h-4 w-4 text-emerald-500" />Financial Goals
            </CardTitle>
            <CardDescription>Progress menabung teratas</CardDescription>
          </div>
          <Link
            href="/goals"
            className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5"
          >
            Semua <IconArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">Belum ada goal yang dibuat.</p>
        ) : (
          items.map((g, i) => {
            const color = g.color || GOAL_COLORS[i % GOAL_COLORS.length];
            const remaining = g.target_amount - g.current_amount;
            return (
              <div key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none">{g.icon || '🎯'}</span>
                    <span className="text-xs font-semibold text-foreground/90 truncate">{g.name}</span>
                  </div>
                  <span
                    className="text-xs font-bold tabular-nums flex-shrink-0"
                    style={{ color }}
                  >
                    {g.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${g.progress}%`, background: color }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="tabular-nums">{fmt(g.current_amount)}</span>
                  <span className="tabular-nums">
                    {remaining > 0 ? `Sisa ${fmt(remaining)}` : '✅ Tercapai!'}
                    {g.deadline && ` · ${g.deadline}`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
