import { Link } from '@inertiajs/react';
import {
    IconCash,
    IconBuildingBank,
    IconDeviceMobile,
    IconWallet,
    IconArrowRight,
} from '@tabler/icons-react';
import {
    Wallet as LucideWallet,
    Landmark,
    CreditCard,
    Banknote,
    Coins,
    PiggyBank,
    Smartphone,
    Bitcoin,
    Activity,
    Briefcase,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface WalletEntry {
    name: string;
    balance: number;
    type: string;
    color: string | null;
    icon?: string | null;
}

const WALLET_ICONS: Record<string, React.ElementType> = {
    Wallet: LucideWallet,
    Landmark,
    CreditCard,
    Banknote,
    Coins,
    PiggyBank,
    Smartphone,
    Bitcoin,
    Activity,
    Briefcase,
};

function getTypeIcon(wallet: WalletEntry) {
    if (wallet.icon && WALLET_ICONS[wallet.icon]) {
        const Icon = WALLET_ICONS[wallet.icon];
        return <Icon className="h-4 w-4" />;
    }
    switch (wallet.type) {
        case 'cash':
            return <IconCash className="h-4 w-4" />;
        case 'bank':
            return <IconBuildingBank className="h-4 w-4" />;
        case 'ewallet':
            return <IconDeviceMobile className="h-4 w-4" />;
        default:
            return <IconWallet className="h-4 w-4" />;
    }
}

function getTypeLabel(type: string) {
    switch (type) {
        case 'cash':
            return 'Cash on hand';
        case 'bank':
            return 'Bank account';
        case 'ewallet':
            return 'E-Wallet / Digital';
        default:
            return 'Digital account';
    }
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n);

export function WalletDonutChart({ wallets }: { wallets: WalletEntry[] }) {
    if (wallets.length === 0) {
        return (
            <div className="bg-card/30 border border-border/50 rounded-2xl p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <IconWallet className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm">Belum ada wallet aktif.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <IconWallet className="h-4 w-4 text-primary" />
                    Wallet Accounts
                </h3>
                <Link
                    href="/wallets"
                    className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-0.5"
                >
                    Kelola <IconArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
                {wallets.map((wallet, i) => (
                    <Card key={`${wallet.name}-${i}`} className="@container/card">
                        <CardHeader>
                            <CardDescription className="capitalize">{wallet.type}</CardDescription>
                            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
                                {fmt(wallet.balance)}
                            </CardTitle>
                            <CardAction>
                                <Badge
                                    variant="outline"
                                    style={
                                        wallet.color
                                            ? {
                                                  borderColor: wallet.color + '60',
                                                  color: wallet.color,
                                                  background: wallet.color + '15',
                                              }
                                            : undefined
                                    }
                                >
                                    {getTypeIcon(wallet)}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium text-foreground/90">
                                {wallet.name}
                                {getTypeIcon(wallet)}
                            </div>
                            <div className="text-muted-foreground text-xs">{getTypeLabel(wallet.type)}</div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
