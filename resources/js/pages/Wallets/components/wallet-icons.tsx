import React from 'react';
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
    Briefcase
} from 'lucide-react';
import {
    IconWallet,
    IconBuildingBank,
    IconDeviceMobile,
    IconCash,
} from '@tabler/icons-react';
import type { Wallet } from '@/types';

export const WALLET_ICONS = {
    'Wallet': LucideWallet,
    'Landmark': Landmark,
    'CreditCard': CreditCard,
    'Banknote': Banknote,
    'Coins': Coins,
    'PiggyBank': PiggyBank,
    'Smartphone': Smartphone,
    'Bitcoin': Bitcoin,
    'Activity': Activity,
    'Briefcase': Briefcase,
};

export const getTypeIcon = (wallet: Wallet) => {
    if (wallet.icon && WALLET_ICONS[wallet.icon as keyof typeof WALLET_ICONS]) {
        const Icon = WALLET_ICONS[wallet.icon as keyof typeof WALLET_ICONS];
        return <Icon className="h-4 w-4" />;
    }

    switch (wallet.type) {
        case 'cash': return <IconCash className="h-4 w-4" />;
        case 'bank': return <IconBuildingBank className="h-4 w-4" />;
        case 'ewallet': return <IconDeviceMobile className="h-4 w-4" />;
        default: return <IconWallet className="h-4 w-4" />;
    }
};

export const getTypeColor = (type: string) => {
    switch (type) {
        case 'cash': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'bank': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'ewallet': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};
