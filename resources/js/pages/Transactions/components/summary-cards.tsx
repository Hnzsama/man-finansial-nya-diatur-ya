import { format } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '@/components/ui/card';

interface SummaryCardsProps {
    stats: {
        total_income: string;
        total_expense: string;
        net_flow: string;
        income_change: number;
        expense_change: number;
    };
    filters: {
        start_date: string;
        end_date: string;
    };
}

export function SummaryCards({ stats, filters }: SummaryCardsProps) {
    const netFlow = parseFloat(stats.net_flow);
    const hasDateRange = filters.start_date && filters.start_date !== 'all';

    return (
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>
                        Income {hasDateRange ? `from ${format(new Date(filters.start_date), 'dd MMM yy')} to ${format(new Date(filters.end_date), 'dd MMM yy')}` : 'All Time'}
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        Rp {parseFloat(stats.total_income).toLocaleString('id-ID')}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <LucideIcons.TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            {stats.income_change >= 0 ? '+' : ''}{stats.income_change}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Income flow <LucideIcons.TrendingUp className="size-4 text-green-500" /></div>
                    <div className="text-muted-foreground">Total money received in selected period</div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>
                        Expense {hasDateRange ? `from ${format(new Date(filters.start_date), 'dd MMM yy')} to ${format(new Date(filters.end_date), 'dd MMM yy')}` : 'All Time'}
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        Rp {parseFloat(stats.total_expense).toLocaleString('id-ID')}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <LucideIcons.TrendingDown className="h-4 w-4 text-rose-500 mr-1" />
                            {stats.expense_change > 0 ? '+' : ''}{stats.expense_change}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Spending flow <LucideIcons.TrendingDown className="size-4 text-rose-500" /></div>
                    <div className="text-muted-foreground">Total money spent in selected period</div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Net Flow</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {netFlow >= 0 ? '+' : '-'}Rp {Math.abs(netFlow).toLocaleString('id-ID')}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {netFlow >= 0 ? <LucideIcons.ArrowUpRight className="h-4 w-4 text-green-500 mr-1" /> : <LucideIcons.ArrowDownRight className="h-4 w-4 text-rose-500 mr-1" />}
                            {stats.income_change >= stats.expense_change ? 'Positive' : 'Negative'}
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Net movement <LucideIcons.Activity className="size-4 text-primary" /></div>
                    <div className="text-muted-foreground">Overall balance change</div>
                </CardFooter>
            </Card>
        </div>
    );
}
