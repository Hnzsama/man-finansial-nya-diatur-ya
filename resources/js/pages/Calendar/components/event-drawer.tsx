import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { IconArrowUpRight, IconArrowDownLeft, IconTarget, IconCoins, IconRepeat, IconArrowsRightLeft } from '@tabler/icons-react';

interface EventItem {
  id: number;
  type: 'income' | 'expense' | 'goal' | 'debt_payable' | 'debt_receivable' | 'subscription' | 'transfer';
  title: string;
  amount: number;
  subtitle?: string;
  notes?: string | null;
  categoryName?: string;
  isTransfer?: boolean;
}

interface EventDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  events: EventItem[];
  formatCurrency: (value: number | string) => string;
}

export function EventDrawer({
  isOpen,
  onOpenChange,
  selectedDate,
  events,
  formatCurrency,
}: EventDrawerProps) {
  const formattedDate = React.useMemo(() => {
    if (!selectedDate) return '';
    // Parse YYYY-MM-DD as local midnight to avoid UTC offset shifting the date
    const [y, m, d] = selectedDate.split('-').map(Number);
    const localDate = new Date(y, m - 1, d);
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Separate transfer events from real financial events
  const transferEvents = events.filter((e) => e.type === 'transfer');
  const financialEvents = events.filter((e) => e.type !== 'transfer');

  const renderEvent = (event: EventItem, index: number) => {
    const isTransfer = event.type === 'transfer';

    return (
      <div
        key={`${event.type}-${event.id}-${index}`}
        className={`flex items-start justify-between p-4 rounded-xl transition-all shadow-sm ${
          isTransfer
            ? 'border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-80'
            : 'border border-border/50 bg-muted/20 hover:bg-muted/40'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {event.type === 'income' && (
              <div className="p-2 bg-green-500/10 text-green-600 rounded-lg dark:text-green-400">
                <IconArrowDownLeft className="h-4 w-4" />
              </div>
            )}
            {event.type === 'expense' && (
              <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                <IconArrowUpRight className="h-4 w-4" />
              </div>
            )}
            {event.type === 'goal' && (
              <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-lg dark:text-yellow-400">
                <IconTarget className="h-4 w-4" />
              </div>
            )}
            {event.type === 'subscription' && (
              <div className="p-2 bg-orange-500/10 text-orange-600 rounded-lg dark:text-orange-400">
                <IconRepeat className="h-4 w-4" />
              </div>
            )}
            {event.type === 'debt_payable' && (
              <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg dark:text-indigo-400">
                <IconCoins className="h-4 w-4" />
              </div>
            )}
            {event.type === 'debt_receivable' && (
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg dark:text-purple-400">
                <IconCoins className="h-4 w-4" />
              </div>
            )}
            {event.type === 'transfer' && (
              <div className="p-2 bg-zinc-500/10 text-zinc-500 rounded-lg dark:text-zinc-400">
                <IconArrowsRightLeft className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold leading-tight">{event.title}</p>
            {event.subtitle && (
              <p className="text-xs text-muted-foreground font-light">{event.subtitle}</p>
            )}
            {event.notes && !isTransfer && (
              <p className="text-xs italic text-muted-foreground/80 mt-1 max-w-[240px] break-words">
                &ldquo;{event.notes}&rdquo;
              </p>
            )}
            {isTransfer && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 mt-0.5">
                ⚠ Not counted in Income / Expense
              </span>
            )}
          </div>
        </div>

        <div className="text-right space-y-1.5">
          <p className={`text-sm font-bold tabular-nums ${
            event.type === 'income' ? 'text-green-600 dark:text-green-400' :
            event.type === 'expense' ? 'text-destructive' :
            event.type === 'transfer' ? 'text-zinc-500 dark:text-zinc-400' :
            'text-foreground'
          }`}>
            {event.type === 'income' ? '+' : event.type === 'expense' ? '-' : ''}
            {formatCurrency(event.amount)}
          </p>
          <Badge
            variant="outline"
            className={`capitalize text-[10px] py-0 px-2 font-normal leading-normal ${
              isTransfer ? 'border-zinc-300 dark:border-zinc-700 text-zinc-500' : ''
            }`}
          >
            {isTransfer ? 'transfer' : event.type.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md p-6 flex flex-col h-full">
        <SheetHeader className="mb-6">
          <SheetTitle>Daily Overview</SheetTitle>
          <SheetDescription>{formattedDate}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 -mx-6 px-6 overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-sm">No transactions or financial deadlines scheduled for this day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Real financial events first */}
              {financialEvents.map((event, index) => renderEvent(event, index))}

              {/* Transfer Fund section — shown separately with clear disclaimer */}
              {transferEvents.length > 0 && (
                <>
                  {financialEvents.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-zinc-800" />
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                        Internal Transfers (excluded from summary)
                      </span>
                      <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-zinc-800" />
                    </div>
                  )}
                  {financialEvents.length === 0 && (
                    <div className="flex items-center gap-2 pb-1">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                        Internal Transfers (excluded from summary)
                      </span>
                    </div>
                  )}
                  {transferEvents.map((event, index) => renderEvent(event, index + financialEvents.length))}
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
