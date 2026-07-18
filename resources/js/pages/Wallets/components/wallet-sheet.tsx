import React from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { store, update } from '@/actions/App/Http/Controllers/WalletController';
import { WALLET_ICONS } from './columns';

interface Wallet {
    id: number;
    name: string;
    type: 'cash' | 'bank' | 'ewallet' | 'digital';
    current_balance: number;
    opening_balance: number;
    icon?: string;
}

interface WalletSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'add' | 'edit';
    wallet?: Wallet | null;
    onSuccess?: () => void;
}

export function WalletSheet({ isOpen, onOpenChange, mode, wallet, onSuccess }: WalletSheetProps) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        type: 'cash',
        opening_balance: '',
        icon: '',
    });

    React.useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && wallet) {
                setData({
                    name: wallet.name,
                    type: wallet.type,
                    opening_balance: wallet.opening_balance.toString(),
                    icon: wallet.icon || '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, mode, wallet]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'add') {
            post(store.url(), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    onSuccess?.();
                },
            });
        } else if (mode === 'edit' && wallet) {
            patch(update.url(wallet.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="px-6 pt-6">
                    <SheetTitle>{mode === 'add' ? 'Add New Wallet' : 'Edit Wallet'}</SheetTitle>
                    <SheetDescription>
                        {mode === 'add'
                            ? 'Create a new wallet to track your money.'
                            : 'Modify wallet details and balance.'}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6 px-6 pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Wallet Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Main Bank Account"
                            required
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Account Type</Label>
                        <Select value={data.type} onValueChange={(val: any) => setData('type', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank">Bank Account</SelectItem>
                                <SelectItem value="ewallet">E-Wallet</SelectItem>
                                <SelectItem value="digital">Digital Asset</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="opening_balance">Opening Balance</Label>
                        <AmountInput
                            id="opening_balance"
                            value={data.opening_balance}
                            onChange={(val) => setData('opening_balance', val)}
                            placeholder="0"
                            required
                            disabled={mode === 'edit'}
                        />
                        {errors.opening_balance && (
                            <p className="text-sm text-destructive">{errors.opening_balance}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon (Optional)</Label>
                        <Select
                            value={data.icon || 'none'}
                            onValueChange={(val) => setData('icon', val === 'none' ? '' : val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Default Icon" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Default Icon</SelectItem>
                                {Object.keys(WALLET_ICONS).map((iconName) => {
                                    const IconComponent = WALLET_ICONS[iconName as keyof typeof WALLET_ICONS];
                                    return (
                                        <SelectItem key={iconName} value={iconName}>
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="h-4 w-4" />
                                                <span>{iconName}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {errors.icon && <p className="text-sm text-destructive">{errors.icon}</p>}
                    </div>

                    <Button type="submit" className="w-full mt-6" disabled={processing}>
                        {processing ? 'Saving...' : mode === 'add' ? 'Save Wallet' : 'Update Wallet'}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
