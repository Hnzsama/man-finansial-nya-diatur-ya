import { IconReport } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface TrendPoint {
  date: string;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: TrendPoint[];
}

const chartConfig = {
  income: { label: 'Income', color: 'hsl(var(--primary))' },
  expense: { label: 'Expense', color: 'var(--destructive)' },
} satisfies ChartConfig;

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <Card className="lg:col-span-2 bg-card/40 border border-border/50 shadow-xs backdrop-blur-xs">
      <CardHeader>
        <CardTitle className="text-md font-semibold flex items-center gap-2">
          <IconReport className="h-4 w-4 text-primary" />
          Monthly Cash Flow Trends
        </CardTitle>
        <CardDescription>Income vs expense patterns grouped monthly</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
            No enough history to plot trend charts.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={value => {
                  const parts = value.split('-');
                  return parts.length > 1 ? `${parts[1]}/${parts[0].slice(2)}` : value;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                tickFormatter={value => {
                  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}M`;
                  if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}k`;
                  return `Rp ${value}`;
                }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area dataKey="income" type="monotone" fill="url(#fillIncome)" stroke="var(--color-income)" strokeWidth={2} />
              <Area dataKey="expense" type="monotone" fill="url(#fillExpense)" stroke="var(--color-expense)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
