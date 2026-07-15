import { IconSearch } from '@tabler/icons-react';
import * as LucideIcons from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import type { Wallet, Category } from '@/types';

interface FilterBarProps {
    filters: {
        start_date: string;
        end_date: string;
        wallet_id: string;
        category_id: string;
        type: string;
        search: string;
    };
    wallets: Wallet[];
    categories: Category[];
    onFiltersChange: (updates: Record<string, any>) => void;
}

const DynamicIcon = ({ name, className }: { name: string | null, className?: string }) => {
    if (!name) {
return <LucideIcons.CircleDashed className={className} />;
}

    const Icon = (LucideIcons as any)[name];

    return Icon ? <Icon className={className} /> : <LucideIcons.CircleDashed className={className} />;
};

export function FilterBar({ filters, wallets, categories, onFiltersChange }: FilterBarProps) {
    const [searchVal, setSearchVal] = React.useState(filters.search || '');

    React.useEffect(() => {
        setSearchVal(filters.search || '');
    }, [filters.search]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchVal !== (filters.search || '')) {
                onFiltersChange({ search: searchVal });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchVal, onFiltersChange, filters.search]);

    const dateRange: DateRange | undefined = React.useMemo(() => {
        if (!filters.start_date || !filters.end_date || filters.start_date === 'all' || filters.end_date === 'all') {
            return undefined;
        }
        return {
            from: new Date(filters.start_date),
            to: new Date(filters.end_date),
        };
    }, [filters.start_date, filters.end_date]);

    const handleDateSelect = (range: DateRange | undefined) => {
        if (range?.from && range?.to) {
            onFiltersChange({
                start_date: format(range.from, 'yyyy-MM-dd'),
                end_date: format(range.to, 'yyyy-MM-dd'),
            });
        } else if (range?.from) {
            onFiltersChange({
                start_date: format(range.from, 'yyyy-MM-dd'),
                end_date: format(range.from, 'yyyy-MM-dd'),
            });
        } else {
            onFiltersChange({
                start_date: 'all',
                end_date: 'all',
            });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search transactions..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="pl-9 bg-card w-full"
                />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full sm:w-[260px] justify-start text-left font-normal bg-card",
                                (!filters.start_date || filters.start_date === 'all') && "text-muted-foreground"
                            )}
                        >
                            <LucideIcons.Calendar className="mr-2 h-4 w-4" />
                            {filters.start_date && filters.start_date !== 'all' ? (
                                filters.end_date && filters.end_date !== 'all' ? (
                                    <>
                                        {format(new Date(filters.start_date), "dd MMM yyyy")} -{" "}
                                        {format(new Date(filters.end_date), "dd MMM yyyy")}
                                    </>
                                ) : (
                                    format(new Date(filters.start_date), "dd MMM yyyy")
                                )
                            ) : (
                                <span>All Time (Semua Waktu)</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-2 border-b border-border/40 flex items-center justify-between">
                            <span className="text-xs font-medium">Filter Tanggal</span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                                onClick={() => onFiltersChange({ start_date: 'all', end_date: 'all' })}
                            >
                                Semua Waktu
                            </Button>
                        </div>
                        <Calendar
                            mode="range"
                            defaultMonth={dateRange?.from || new Date()}
                            selected={dateRange}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                <Select value={filters.wallet_id || 'all'} onValueChange={(v) => onFiltersChange({ wallet_id: v })}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-card">
                        <SelectValue placeholder="All Wallets" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Wallets</SelectItem>
                        {wallets.map(w => (
                            <SelectItem key={w.id} value={w.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <DynamicIcon name={w.icon} className="w-4 h-4" />
                                    <span>{w.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.category_id || 'all'} onValueChange={(v) => onFiltersChange({ category_id: v })}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-card">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <DynamicIcon name={c.icon} className="w-4 h-4" />
                                    <span>{c.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.type || 'all'} onValueChange={(v) => onFiltersChange({ type: v })}>
                    <SelectTrigger className="w-full sm:w-[140px] bg-card">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
