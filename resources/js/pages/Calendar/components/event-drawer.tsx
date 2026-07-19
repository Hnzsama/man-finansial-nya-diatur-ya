import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { IconArrowUpRight, IconArrowDownLeft, IconTarget, IconCoins, IconRepeat } from '@tabler/icons-react';

interface EventItem {
  id: number;
  type: 'income' | 'expense' | 'goal' | 'debt_payable' | 'debt_receivable' | 'subscription';
  title: string;
  amount: number;
  subtitle?: string;
  notes?: string | null;
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
    return new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

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
            <div className="space-y-4">
              {events.map((event, index) => (
                <div
                  key={`${event.type}-${event.id}-${index}`}
                  className="flex items-start justify-between p-4 border border-border/50 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all shadow-sm"
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
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-tight">{event.title}</p>
                      {event.subtitle && (
                        <p className="text-xs text-muted-foreground font-light">{event.subtitle}</p>
                      )}
                      {event.notes && (
                        <p className="text-xs italic text-muted-foreground/80 mt-1 max-w-[240px] break-words">
                          &ldquo;{event.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1.5">
                    <p className={`text-sm font-bold tabular-nums ${
                      event.type === 'income' ? 'text-green-600 dark:text-green-400' :
                      event.type === 'expense' ? 'text-destructive' :
                      'text-foreground'
                    }`}>
                      {event.type === 'income' ? '+' : event.type === 'expense' ? '-' : ''}
                      {formatCurrency(event.amount)}
                    </p>
                    <Badge variant="outline" className="capitalize text-[10px] py-0 px-2 font-normal leading-normal">
                      {event.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
