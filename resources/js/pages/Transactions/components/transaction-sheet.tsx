import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import React from 'react';
import { store as transactionStore, update as transactionUpdate } from '@/actions/App/Http/Controllers/TransactionController';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { Wallet, Category, Transaction } from '@/types';

const DynamicIcon = ({ name, className }: { name?: string | null; className?: string }) => {
    if (!name) {
return <LucideIcons.Folder className={className} />;
}

    const IconComponent = (LucideIcons as any)[name];

    if (!IconComponent) {
return <LucideIcons.Folder className={className} />;
}

    return <IconComponent className={className} />;
};

interface TransactionSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'add' | 'edit';
    transaction?: Transaction | null;
    wallets: Wallet[];
    categories: Category[];
    onSuccess?: () => void;
}

export function TransactionSheet({
    isOpen,
    onOpenChange,
    mode,
    transaction,
    wallets,
    categories,
    onSuccess
}: TransactionSheetProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        wallet_id: transaction?.wallet_id.toString() || wallets[0]?.id.toString() || '',
        category_id: transaction?.category_id?.toString() || '',
        type: transaction?.type || 'expense',
        amount: transaction?.amount || '',
        date: transaction ? transaction.date.split(/[ T]/)[0] : new Date().toLocaleDateString('en-CA'),
        notes: transaction?.notes || '',
    });

    const [walletSearch, setWalletSearch] = React.useState('');
    const [isWalletOpen, setIsWalletOpen] = React.useState(false);
    const [categorySearch, setCategorySearch] = React.useState('');
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);

    const filteredWallets = React.useMemo(() => {
        return wallets.filter((w) => w.name.toLowerCase().includes(walletSearch.toLowerCase()));
    }, [wallets, walletSearch]);

    const filteredCategories = React.useMemo(() => {
        return categories
            .filter((c) => c.type === data.type)
            .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    }, [categories, data.type, categorySearch]);

    const selectedWallet = React.useMemo(() => {
        return wallets.find((w) => w.id.toString() === data.wallet_id);
    }, [wallets, data.wallet_id]);

    const selectedCategory = React.useMemo(() => {
        return categories.find((c) => c.id.toString() === data.category_id);
    }, [categories, data.category_id]);

    // Reset form when transaction changes
    React.useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && transaction) {
                setData({
                    wallet_id: transaction.wallet_id.toString(),
                    category_id: transaction.category_id?.toString() || '',
                    type: transaction.type,
                    amount: transaction.amount,
                    date: transaction.date.split(/[ T]/)[0],
                    notes: transaction.notes || '',
                });
            } else if (mode === 'add') {
                reset();
                setData('date', new Date().toLocaleDateString('en-CA'));
            }
        }
    }, [isOpen, transaction, mode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'add') {
            post(transactionStore.url(), {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    onSuccess?.();
                },
            });
        } else if (mode === 'edit' && transaction) {
            put(transactionUpdate.url({ transaction: transaction.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-md overflow-y-auto p-0">
                <SheetHeader className="px-6 pt-6">
                    <SheetTitle>{mode === 'add' ? 'Add Transaction' : 'Edit Transaction'}</SheetTitle>
                    <SheetDescription>
                        {mode === 'add' ? 'Record a new transaction to track your spending.' : 'Update the details for this transaction.'}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6 px-6 pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select 
                            value={data.type} 
                            onValueChange={(v: 'income'|'expense') => setData('type', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">Rp</span>
                            <AmountInput
                                id="amount"
                                className="pl-9"
                                value={data.amount}
                                onChange={(val) => setData('amount', val)}
                                placeholder="0"
                                required
                            />
                        </div>
                        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="wallet">Wallet</Label>
                        <Popover open={isWalletOpen} onOpenChange={setIsWalletOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between text-left font-normal"
                                >
                                    {selectedWallet ? selectedWallet.name : "Select wallet..."}
                                    <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <div className="p-2 border-b border-border/40">
                                    <Input
                                        placeholder="Search wallet..."
                                        value={walletSearch}
                                        onChange={(e) => setWalletSearch(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="max-h-[200px] overflow-y-auto overscroll-contain p-1 space-y-0.5" style={{ touchAction: 'pan-y' }}>
                                    {filteredWallets.length === 0 ? (
                                        <div className="text-xs text-muted-foreground text-center py-4">No wallet found.</div>
                                    ) : (
                                        filteredWallets.map((w) => (
                                            <button
                                                key={w.id}
                                                type="button"
                                                className={cn(
                                                    "w-full text-left px-2.5 py-2 text-xs rounded-md flex items-center justify-between transition-colors hover:bg-muted/80",
                                                    data.wallet_id === w.id.toString() && "bg-muted font-medium"
                                                )}
                                                onClick={() => {
                                                    setData('wallet_id', w.id.toString());
                                                    setIsWalletOpen(false);
                                                    setWalletSearch('');
                                                }}
                                            >
                                                <span>{w.name}</span>
                                                {data.wallet_id === w.id.toString() && (
                                                    <IconCheck className="h-3.5 w-3.5 text-primary" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {errors.wallet_id && <p className="text-sm text-red-500">{errors.wallet_id}</p>}
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="category">Category</Label>
                        <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between text-left font-normal"
                                >
                                    {selectedCategory ? (
                                        <div className="flex items-center gap-2">
                                            <DynamicIcon name={selectedCategory.icon} className="w-4 h-4 text-muted-foreground" />
                                            <span>{selectedCategory.name}</span>
                                        </div>
                                    ) : (
                                        "Select category..."
                                    )}
                                    <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <div className="p-2 border-b border-border/40">
                                    <Input
                                        placeholder="Search category..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="max-h-[200px] overflow-y-auto overscroll-contain p-1 space-y-0.5" style={{ touchAction: 'pan-y' }}>
                                    {filteredCategories.length === 0 ? (
                                        <div className="text-xs text-muted-foreground text-center py-4">No category found.</div>
                                    ) : (
                                        filteredCategories.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={cn(
                                                    "w-full text-left px-2.5 py-2 text-xs rounded-md flex items-center justify-between transition-colors hover:bg-muted/80",
                                                    data.category_id === c.id.toString() && "bg-muted font-medium"
                                                )}
                                                onClick={() => {
                                                    setData('category_id', c.id.toString());
                                                    setIsCategoryOpen(false);
                                                    setCategorySearch('');
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <DynamicIcon name={c.icon} className="w-4 h-4 text-muted-foreground" />
                                                    <span>{c.name}</span>
                                                </div>
                                                {data.category_id === c.id.toString() && (
                                                    <IconCheck className="h-3.5 w-3.5 text-primary" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.date && "text-muted-foreground"
                                    )}
                                >
                                    <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                                    {data.date ? format(new Date(data.date), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.date ? new Date(data.date) : undefined}
                                    onSelect={(date) => setData('date', date ? format(date, 'yyyy-MM-dd') : '')}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Any details..."
                        />
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={processing}>
                        {processing ? 'Saving...' : (mode === 'add' ? 'Save Transaction' : 'Update Transaction')}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
