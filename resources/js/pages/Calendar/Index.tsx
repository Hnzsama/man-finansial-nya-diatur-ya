import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { IconChevronLeft, IconChevronRight, IconArrowUpRight, IconArrowDownLeft, IconTarget, IconCoins, IconRepeat } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarController';
import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { EventDrawer } from './components/event-drawer';
import { toLocalDateString, localTodayString } from '@/lib/utils';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number | string;
  date: string;
  notes: string | null;
  wallet?: { name: string };
  category?: { name: string };
}

interface Goal {
  id: number;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  deadline: string;
}

interface Debt {
  id: number;
  type: 'payable' | 'receivable';
  counterparty_name: string;
  amount: number | string;
  remaining_amount: number | string;
  due_date: string;
  notes: string | null;
}

interface Subscription {
  id: number;
  name: string;
  amount: number | string;
  next_billing_date: string;
}

interface PageProps {
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  subscriptions: Subscription[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Financial Calendar',
    href: calendarIndex.url(),
  },
];

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue);
};

const formatCompactCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numericValue >= 1000000) {
    return `${(numericValue / 1000000).toFixed(1).replace('.0', '')}M`;
  }
  if (numericValue >= 1000) {
    return `${(numericValue / 1000).toFixed(0)}k`;
  }
  return numericValue.toString();
};

export default function CalendarIndex({
  transactions,
  goals,
  debts,
  subscriptions,
}: PageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar dates generation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth - 1, prevTotalDays - i);
      const yyyy = prevDate.getFullYear();
      const mm = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dd = String(prevDate.getDate()).padStart(2, '0');
      cells.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayNum: prevTotalDays - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const mm = String(currentMonth + 1).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      cells.push({
        dateStr: `${currentYear}-${mm}-${dd}`,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Next month overflow days
    const totalCellsSoFar = cells.length;
    const nextDaysNeeded = totalCellsSoFar <= 35 ? 35 - totalCellsSoFar : 42 - totalCellsSoFar;
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      cells.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentMonth, currentYear]);

  // Daily events lookup map
  const eventsMap = useMemo(() => {
    const map: Record<string, any[]> = {};

    const addEvent = (dateStr: string, event: any) => {
      const formattedDateStr = toLocalDateString(dateStr);
      if (!map[formattedDateStr]) map[formattedDateStr] = [];
      map[formattedDateStr].push(event);
    };

    transactions.forEach((tx) => {
      addEvent(tx.date, {
        id: tx.id,
        type: tx.type,
        title: tx.notes || tx.category?.name || (tx.type === 'income' ? 'Income' : 'Expense'),
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
        subtitle: `${tx.wallet?.name || 'Wallet'} • ${tx.category?.name || 'General'}`,
        notes: tx.notes,
      });
    });

    goals.forEach((g) => {
      addEvent(g.deadline, {
        id: g.id,
        type: 'goal',
        title: g.name,
        amount: typeof g.target_amount === 'string' ? parseFloat(g.target_amount) : g.target_amount,
        subtitle: `Progress: ${formatCurrency(g.current_amount)} of ${formatCurrency(g.target_amount)}`,
        notes: 'Savings objective target date reached',
      });
    });

    debts.forEach((d) => {
      addEvent(d.due_date, {
        id: d.id,
        type: d.type === 'payable' ? 'debt_payable' : 'debt_receivable',
        title: d.type === 'payable' ? `Pay to: ${d.counterparty_name}` : `Due from: ${d.counterparty_name}`,
        amount: typeof d.remaining_amount === 'string' ? parseFloat(d.remaining_amount) : d.remaining_amount,
        subtitle: `Remaining balance: ${formatCurrency(d.remaining_amount)}`,
        notes: d.notes,
      });
    });

    subscriptions.forEach((sub) => {
      addEvent(sub.next_billing_date, {
        id: sub.id,
        type: 'subscription',
        title: sub.name,
        amount: typeof sub.amount === 'string' ? parseFloat(sub.amount) : sub.amount,
        subtitle: 'Recurring payment billing scheduled',
        notes: 'Monthly/Yearly repeating cost deduction',
      });
    });

    return map;
  }, [transactions, goals, debts, subscriptions]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsMap[selectedDate] || [];
  }, [selectedDate, eventsMap]);

  const handleCellClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDrawerOpen(true);
  };

  const todayStr = useMemo(() => localTodayString(), []);

  return (
    <>
      <Head title="Financial Calendar" />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Financial Calendar</h2>
                <p className="text-sm text-muted-foreground font-light">
                  Daily roadmap view of income cashflows, saving milestones, bills, and debt repayments.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 bg-card/50 border border-border/50 p-1.5 rounded-xl shadow-xs w-fit">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold px-2 min-w-[120px] text-center">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Summary cards */}
            <CollapsibleSummary>
              <SummaryCards
                currentMonth={currentMonth}
                currentYear={currentYear}
                transactions={transactions}
                goals={goals}
                debts={debts}
                subscriptions={subscriptions}
                formatCurrency={formatCurrency}
              />
            </CollapsibleSummary>

            {/* Calendar Grid Section */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              {/* Day names */}
              <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30 text-center py-2.5 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid cell layout */}
              <div className="grid grid-cols-7 auto-rows-[130px] sm:auto-rows-[160px] divide-x divide-y divide-border/10 border-t border-l border-border/10">
                {calendarCells.map((cell) => {
                  const dayEvents = eventsMap[cell.dateStr] || [];
                  const isToday = cell.dateStr === todayStr;

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => handleCellClick(cell.dateStr)}
                      className={`relative p-2 flex flex-col justify-start cursor-pointer select-none transition-all duration-200 hover:bg-muted/40 hover:shadow-inner ${
                        cell.isCurrentMonth ? 'bg-card/40' : 'bg-muted/5 text-muted-foreground/30'
                      } ${
                        isToday ? 'ring-1 ring-primary/30 bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold h-6 w-6 flex items-center justify-center rounded-full transition-colors ${
                          isToday
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-extrabold'
                            : cell.isCurrentMonth
                            ? 'text-foreground/90'
                            : 'text-muted-foreground/30'
                        }`}>
                          {cell.dayNum}
                        </span>
                      </div>

                      {/* Event Cards inside cell */}
                      <div className="flex flex-col gap-1 overflow-hidden select-none">
                        {dayEvents.slice(0, 3).map((evt, idx) => {
                          const Icon = evt.type === 'income' ? IconArrowDownLeft :
                                       evt.type === 'expense' ? IconArrowUpRight :
                                       evt.type === 'goal' ? IconTarget :
                                       evt.type === 'subscription' ? IconRepeat :
                                       IconCoins;

                          return (
                            <div
                              key={idx}
                              title={`${evt.title} (${formatCurrency(evt.amount)})`}
                              className={`text-[9px] sm:text-[10px] leading-none px-1.5 py-1 rounded border flex items-center justify-between font-medium truncate gap-1 shadow-sm transition-all hover:brightness-95 ${
                                  evt.type === 'income' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                                  evt.type === 'expense' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                  evt.type === 'goal' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' :
                                  evt.type === 'subscription' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                                  evt.type === 'debt_payable' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                                  'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              }`}
                            >
                              <div className="flex items-center gap-0.5 truncate flex-1">
                                <Icon className="h-2.5 w-2.5 shrink-0 opacity-80" />
                                <span className="truncate text-left font-semibold">{evt.title}</span>
                              </div>
                              <span className="font-bold shrink-0 text-[8px] sm:text-[9px]">{formatCompactCurrency(evt.amount)}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span className="text-[8px] sm:text-[9px] text-muted-foreground text-center font-bold">
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected day events preview panel */}
      {selectedDate && (
        <EventDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          selectedDate={selectedDate}
          events={selectedDayEvents}
          formatCurrency={formatCurrency}
        />
      )}
    </>
  );
}

CalendarIndex.layout = (page: React.ReactNode) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {page}
    </AppLayout>
  );
};
