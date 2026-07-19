import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const chartConfigInteractive = {
  transactions: {
    label: "Cash Flow",
  },
  income: {
    label: "Income",
    color: "hsl(var(--primary))",
  },
  expense: {
    label: "Expense",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

export function SpendingChart({ data }: { data: ChartDataPoint[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const date = new Date(item.date);
      const referenceDate = new Date();
      let daysToSubtract = 90;

      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }

      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      startDate.setHours(0, 0, 0, 0);

      return date >= startDate;
    });
  }, [data, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Cash Flow (Income & Expense)</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Financial chart statistics for the selected period
          </span>
          <span className="@[540px]/card:hidden">Cash Flow Chart</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 90 Days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 Days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 Days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select date range"
            >
              <SelectValue placeholder="Last 90 Days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 90 Days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 Days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 Days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[500px] w-full">
            <ChartContainer
              config={chartConfigInteractive}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={10}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    if (value >= 1_000_000) {
                      return `Rp ${(value / 1_000_000).toFixed(0)}M`;
                    }
                    if (value >= 1_000) {
                      return `Rp ${(value / 1_000).toFixed(0)}K`;
                    }
                    return `Rp ${value}`;
                  }}
                  width={65}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area dataKey="expense" type="natural" fill="url(#fillExpense)" stroke="var(--color-expense)" stackId="a" />
                <Area dataKey="income" type="natural" fill="url(#fillIncome)" stroke="var(--color-income)" stackId="a" />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
