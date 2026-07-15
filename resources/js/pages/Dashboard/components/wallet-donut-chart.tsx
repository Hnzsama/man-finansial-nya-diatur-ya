import { IconWallet } from '@tabler/icons-react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

interface WalletEntry {
  name: string;
  balance: number;
  type: string;
  color: string | null;
}

const PALETTE = [
  '#3B5BDB', '#12B76A', '#F79009', '#F04438',
  '#9B8AFB', '#06B6D4', '#EC4899', '#84CC16',
];

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export function WalletDonutChart({ wallets }: { wallets: WalletEntry[] }) {
  const data = wallets.filter(w => w.balance > 0);
  const total = data.reduce((s, w) => s + w.balance, 0);

  const chartConfig = data.reduce<ChartConfig>((cfg, w, i) => {
    cfg[w.name] = { label: w.name, color: w.color || PALETTE[i % PALETTE.length] };
    return cfg;
  }, {});

  if (data.length === 0) {
    return (
      <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <IconWallet className="h-4 w-4 text-primary" />Wallet Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
          No wallet data yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <IconWallet className="h-4 w-4 text-primary" />Wallet Balance Distribution
        </CardTitle>
        <CardDescription>Alokasi saldo antar akun</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ChartContainer config={chartConfig} className="h-[180px] w-[180px] flex-shrink-0">
            <PieChart>
              <Tooltip
                formatter={(value: number) => [fmt(value), '']}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Pie
                data={data}
                dataKey="balance"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={48}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color || PALETTE[i % PALETTE.length]} opacity={0.9} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex-1 w-full space-y-2 min-w-0">
            {data.map((w, i) => {
              const pct = total > 0 ? (w.balance / total) * 100 : 0;
              const color = w.color || PALETTE[i % PALETTE.length];
              return (
                <div key={w.name} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-foreground/90 truncate">
                      <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      {w.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums ml-2 flex-shrink-0">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">{fmt(w.balance)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
