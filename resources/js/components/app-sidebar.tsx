import {
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileDescription,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconReport,
    IconSearch,
    IconSettings,
    IconWallet,
    IconTags,
    IconArrowsRightLeft,
    IconChartPie,
    IconTarget,
    IconCoins,
    IconRepeat,
    IconCalendar,
    IconFileSpreadsheet,
    IconHistory,
    IconReceipt,
} from '@tabler/icons-react';
import * as React from 'react';

import { index as categoryIndex } from '@/actions/App/Http/Controllers/CategoryController';
import { index as transactionIndex } from '@/actions/App/Http/Controllers/TransactionController';
import { index as walletIndex } from '@/actions/App/Http/Controllers/WalletController';
import { index as goalIndex } from '@/actions/App/Http/Controllers/GoalController';
import { index as debtIndex } from '@/actions/App/Http/Controllers/DebtController';
import { index as subscriptionIndex } from '@/actions/App/Http/Controllers/SubscriptionController';
import { index as assetIndex } from '@/actions/App/Http/Controllers/AssetController';
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarController';
import { index as exportsIndex } from '@/actions/App/Http/Controllers/ExportImportController';
import { index as activityLogsIndex } from '@/actions/App/Http/Controllers/ActivityLogController';
import { index as receiptsIndex } from '@/actions/App/Http/Controllers/ReceiptController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ReportController';
import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';

const data = {
    navMain: [
        {
            title: 'Dashboard',
            href: dashboard.url(),
            icon: IconDashboard,
        },
        {
            title: 'Wallets',
            href: walletIndex.url(),
            icon: IconWallet,
        },
        {
            title: 'Categories & Budgets',
            href: categoryIndex.url(),
            icon: IconTags,
        },
        {
            title: 'Transactions',
            href: transactionIndex.url(),
            icon: IconArrowsRightLeft,
        },
        {
            title: 'Goals',
            href: goalIndex.url(),
            icon: IconTarget,
        },
        {
            title: 'Debts & Loans',
            href: debtIndex.url(),
            icon: IconCoins,
        },
        {
            title: 'Subscriptions',
            href: subscriptionIndex.url(),
            icon: IconRepeat,
        },
        {
            title: 'Assets',
            href: assetIndex.url(),
            icon: IconReport,
        },
        {
            title: 'Calendar',
            href: calendarIndex.url(),
            icon: IconCalendar,
        },
    ],
    navSecondary: [
        {
            title: 'Settings',
            href: '#',
            icon: IconSettings,
        },
        {
            title: 'Get Help',
            href: '#',
            icon: IconHelp,
        },
        {
            title: 'Search',
            href: '#',
            icon: IconSearch,
        },
    ],
    documents: [
        {
            title: 'Reports',
            href: reportsIndex.url(),
            icon: IconReport,
        },
        {
            title: 'Export & Import',
            href: exportsIndex.url(),
            icon: IconFileSpreadsheet,
        },
        {
            title: 'Activity Logs',
            href: activityLogsIndex.url(),
            icon: IconHistory,
        },
        {
            title: 'Receipts & Invoices',
            href: receiptsIndex.url(),
            icon: IconReceipt,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <a href={dashboard.url()}>
                                <IconInnerShadowTop className="size-5!" />
                                <span className="text-base font-semibold">
                                    Acme Inc.
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
