import { Head } from '@inertiajs/react';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconCheck,
  IconCoins,
  IconTarget,
  IconSearch
} from '@tabler/icons-react';
import React, { useState, useMemo } from 'react';

import { index as goalIndex } from '@/actions/App/Http/Controllers/GoalController';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { GoalSheet, DynamicIcon } from './components/goal-sheet';
import { AddMoneySheet } from './components/add-money-sheet';

interface Goal {
  id: number;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  deadline: string | null;
  color: string | null;
  icon: string | null;
  progress: number;
}

interface PageProps {
  goals: Goal[];
  error?: string;
  success?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Savings Goals',
    href: goalIndex.url(),
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

export default function GoalsIndex({ goals }: PageProps) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddMoneySheetOpen, setIsAddMoneySheetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGoals = useMemo(() => {
    if (!searchQuery) return goals;
    return goals.filter((g) => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [goals, searchQuery]);

  // 1. Calculate stats
  const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + Number(g.target_amount), 0), [goals]);
  const totalTerkumpul = useMemo(() => goals.reduce((acc, g) => acc + Number(g.current_amount), 0), [goals]);
  const totalSisa = useMemo(() => Math.max(totalTarget - totalTerkumpul, 0), [totalTarget, totalTerkumpul]);
  const goalsAchieved = useMemo(() => goals.filter((g) => Number(g.current_amount) >= Number(g.target_amount)).length, [goals]);

  const openAddSheet = () => {
    setIsAddSheetOpen(true);
  };

  const openEditSheet = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditSheetOpen(true);
  };

  const openAddMoneySheet = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsAddMoneySheetOpen(true);
  };

  // Helper to calculate days remaining
  const getDeadlineText = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'No deadline';
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Deadline is today!';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
    return `${diffDays} day(s) remaining`;
  };

  return (
    <>
      <Head title="Savings Goals" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
                <p className="text-sm text-muted-foreground">Plan for shopping, emergency funds, and other savings targets.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card h-9"
                  />
                </div>
                <Button onClick={openAddSheet} size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <CollapsibleSummary>
              <SummaryCards
                totalTarget={totalTarget}
                totalTerkumpul={totalTerkumpul}
                totalSisa={totalSisa}
                goalsAchieved={goalsAchieved}
                totalGoalsCount={goals.length}
                formatCurrency={formatCurrency}
              />
            </CollapsibleSummary>

            {/* Goals Grid */}
            {filteredGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGoals.map((goal) => {
                  const isAchieved = Number(goal.current_amount) >= Number(goal.target_amount);
                  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isAchieved;

                  return (
                    <Card
                      key={goal.id}
                      className="group relative overflow-hidden rounded-xl border border-border/40 bg-card hover:bg-card/90 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--shadow-color)] hover:-translate-y-0.5"
                      style={{ '--shadow-color': `${goal.color || '#3b82f6'}15` } as React.CSSProperties}
                    >
                      {/* Ambient Background Glow */}
                      <div 
                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20"
                        style={{ backgroundColor: goal.color || '#3b82f6' }}
                      />

                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2.5 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                            style={{ 
                              backgroundColor: `${goal.color || '#3b82f6'}15`, 
                              color: goal.color || 'inherit',
                              border: `1px solid ${goal.color || '#3b82f6'}30`
                            }}
                          >
                            <DynamicIcon name={goal.icon} className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold leading-none">{goal.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Deadline'}
                            </CardDescription>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/80">
                              <IconDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditSheet(goal)}>
                              <IconEdit className="mr-2 h-4 w-4" /> Edit Goal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>

                      <CardContent className="pt-2 pb-4 space-y-4">
                        <div className="space-y-4 pt-1">
                          {/* Progress Percentage */}
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{getDeadlineText(goal.deadline)}</span>
                            <span className={isAchieved ? 'text-green-600 dark:text-green-400 font-bold' : isOverdue ? 'text-destructive font-bold' : 'font-medium'}>
                              {goal.progress}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${Math.min(goal.progress, 100)}%`,
                                backgroundColor: goal.color || '#3b82f6',
                                boxShadow: `0 0 8px ${goal.color || '#3b82f6'}40`
                              }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Saved</span>
                            <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">
                              {formatCurrency(goal.current_amount)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs border-t border-dashed pt-2">
                            <span className="text-muted-foreground">Target Amount</span>
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrency(goal.target_amount)}
                            </span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="bg-muted/10 border-t border-border/30 py-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {isAchieved ? (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                              <IconCheck className="h-4 w-4" /> Goal achieved!
                            </span>
                          ) : (
                            <span>Remaining: {formatCurrency(Math.max(Number(goal.target_amount) - Number(goal.current_amount), 0))}</span>
                          )}
                        </span>
                        
                        {!isAchieved && (
                          <Button size="sm" variant="outline" onClick={() => openAddMoneySheet(goal)}>
                            <IconCoins className="mr-1.5 h-4 w-4" /> Add Savings
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card">
                <IconTarget className="h-12 w-12 text-muted-foreground/50 mb-3 animate-pulse" />
                <h3 className="font-semibold text-lg">No Savings Goals Yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
                  Create a savings goal to collect emergency funds, vacations, or other targets.
                </p>
                <Button onClick={openAddSheet}>Create Your First Goal</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sheets */}
      <GoalSheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        mode="add"
      />

      <GoalSheet
        isOpen={isEditSheetOpen}
        onOpenChange={(open) => {
          setIsEditSheetOpen(open);
          if (!open) setSelectedGoal(null);
        }}
        mode="edit"
        goal={selectedGoal}
      />

      <AddMoneySheet
        isOpen={isAddMoneySheetOpen}
        onOpenChange={(open) => {
          setIsAddMoneySheetOpen(open);
          if (!open) setSelectedGoal(null);
        }}
        goal={selectedGoal}
        formatCurrency={formatCurrency}
      />
    </>
  );
}

GoalsIndex.layout = (page: React.ReactNode) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {page}
    </AppLayout>
  );
};
