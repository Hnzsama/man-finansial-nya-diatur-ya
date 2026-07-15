import { Link } from '@inertiajs/react';
import {
  IconChartBar,
  IconTarget,
  IconCreditCard,
  IconRepeat,
  IconArrowRight,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ROUTES = {
  budgets: '/budgets',
  goals: '/goals',
  debts: '/debts',
  subscriptions: '/subscriptions',
} as const;

interface BudgetsSummary {
  count: number;
  total_limit: number;
  total_spent: number;
}

interface GoalsSummary {
  count: number;
  avg_progress: number;
  nearest_deadline: string | null;
  nearest_name: string | null;
}

interface DebtsSummary {
  total_payable: number;
  total_receivable: number;
  overdue_count: number;
  count: number;
}

interface SubscriptionsSummary {
  count: number;
  monthly_cost: number;
  next_billing: string | null;
  next_name: string | null;
  days_until_next: number | null;
}

interface FeatureOverviewCardsProps {
  budgetsSummary: BudgetsSummary;
  goalsSummary: GoalsSummary;
  debtsSummary: DebtsSummary;
  subscriptionsSummary: SubscriptionsSummary;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function OverviewCard({
  href,
  icon: Icon,
  iconBg,
  title,
  primary,
  secondary,
  badge,
  badgeVariant = 'outline',
}: {
  href: string;
  icon: React.ElementType;
  iconBg: string;
  title: string;
  primary: string;
  secondary: string;
  badge?: string;
  badgeVariant?: 'outline' | 'destructive' | 'default' | 'secondary';
}) {
  return (
    <Link href={href}>
      <Card className="group bg-card/40 hover:bg-card/70 border border-border/50 hover:border-primary/30 shadow-xs transition-all duration-200 cursor-pointer backdrop-blur-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {badge && (
              <Badge variant={badgeVariant} className="text-[9px] h-4 px-1.5">
                {badge}
              </Badge>
            )}
            <div className={`p-1.5 rounded-lg ${iconBg}`}>
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-xl font-bold text-foreground tabular-nums leading-tight">{primary}</div>
          <p className="text-[11px] text-muted-foreground font-light mt-1 flex items-center justify-between">
            <span>{secondary}</span>
            <IconArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FeatureOverviewCards({
  budgetsSummary,
  goalsSummary,
  debtsSummary,
  subscriptionsSummary,
}: FeatureOverviewCardsProps) {
  const budgetPct =
    budgetsSummary.total_limit > 0
      ? Math.round((budgetsSummary.total_spent / budgetsSummary.total_limit) * 100)
      : 0;

  const netDebt = debtsSummary.total_receivable - debtsSummary.total_payable;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 lg:px-6">
      <OverviewCard
      href={ROUTES.budgets}
        icon={IconChartBar}
        iconBg="bg-violet-500"
        title="Budgets"
        primary={`${budgetsSummary.count} active`}
        secondary={`${budgetPct}% of ${fmt(budgetsSummary.total_limit)} used`}
        badge={budgetPct > 85 ? 'Over limit' : undefined}
        badgeVariant="destructive"
      />
      <OverviewCard
      href={ROUTES.goals}
        icon={IconTarget}
        iconBg="bg-emerald-500"
        title="Goals"
        primary={`${goalsSummary.avg_progress}% avg`}
        secondary={
          goalsSummary.nearest_name
            ? `Next: ${goalsSummary.nearest_name}`
            : `${goalsSummary.count} goals tracked`
        }
      />
      <OverviewCard
      href={ROUTES.debts}
        icon={IconCreditCard}
        iconBg={debtsSummary.overdue_count > 0 ? 'bg-red-500' : 'bg-amber-500'}
        title="Debts"
        primary={netDebt >= 0 ? `+${fmt(netDebt)}` : fmt(netDebt)}
        secondary={`${debtsSummary.count} active${debtsSummary.overdue_count > 0 ? ` · ${debtsSummary.overdue_count} overdue` : ''}`}
        badge={debtsSummary.overdue_count > 0 ? `${debtsSummary.overdue_count} overdue` : undefined}
        badgeVariant="destructive"
      />
      <OverviewCard
      href={ROUTES.subscriptions}
        icon={IconRepeat}
        iconBg="bg-sky-500"
        title="Subscriptions"
        primary={fmt(subscriptionsSummary.monthly_cost)}
        secondary={
          subscriptionsSummary.days_until_next != null
            ? `Next bill in ${subscriptionsSummary.days_until_next}d`
            : `${subscriptionsSummary.count} active`
        }
      />
    </div>
  );
}
