import React from 'react';
import {
    IconWallet,
    IconBuildingBank,
    IconDeviceMobile,
    IconCash
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardAction,
    CardFooter,
} from '@/components/ui/card';

interface Stats {
    total_balance: number;
    cash_balance: number;
    bank_balance: number;
    ewallet_balance: number;
}

interface SummaryCardsProps {
    stats: Stats;
    formatCurrency: (amount: number) => string;
}

export function SummaryCards({ stats, formatCurrency }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Balance</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(stats.total_balance)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconWallet className="h-4 w-4" />
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">All wallets combined <IconWallet className="size-4" /></div>
                    <div className="text-muted-foreground">Total of your assets</div>
                </CardFooter>
            </Card>
            
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Bank Accounts</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(stats.bank_balance)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconBuildingBank className="h-4 w-4" />
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Savings & checking <IconBuildingBank className="size-4" /></div>
                    <div className="text-muted-foreground">Regulated financial institutions</div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>E-Wallets</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(stats.ewallet_balance)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconDeviceMobile className="h-4 w-4" />
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Digital payments <IconDeviceMobile className="size-4" /></div>
                    <div className="text-muted-foreground">OVO, Gopay, Dana, etc.</div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Cash</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(stats.cash_balance)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconCash className="h-4 w-4" />
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Physical currency <IconCash className="size-4" /></div>
                    <div className="text-muted-foreground">Cash on hand</div>
                </CardFooter>
            </Card>
        </div>
    );
}
