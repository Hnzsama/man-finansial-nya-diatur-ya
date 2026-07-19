import { Head } from '@inertiajs/react';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCoins,
  IconAlertTriangle,
  IconSearch
} from '@tabler/icons-react';
import * as LucideIcons from 'lucide-react';
import React, { useState } from 'react';

import { index as categoryIndex } from '@/actions/App/Http/Controllers/CategoryController';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { SummaryCards } from './components/summary-cards';
import { CollapsibleSummary } from '@/components/collapsible-summary';
import { CategorySheet, DynamicIcon } from './components/category-sheet';

interface Budget {
  id: number;
  amount_limit: number | string;
  period: string;
  start_date?: string | null;
  end_date?: string | null;
}

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  budget: Budget | null;
  total_spent: number;
  progress: number;
}

interface PageProps {
  categories: Category[];
  stats: {
    total_income_categories: number;
    total_expense_categories: number;
    total_budgeted: number;
    total_spent: number;
    total_budget_remaining: number;
    exceeded_budgets: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Categories & Budgets',
    href: categoryIndex.url(),
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

export default function CategoriesIndex({ categories, stats }: PageProps) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter((c) => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const incomeCategories = filteredCategories.filter((c) => c.type === 'income');
  const expenseCategories = filteredCategories.filter((c) => c.type === 'expense');

  const openAddSheet = () => {
    setIsAddSheetOpen(true);
  };

  const openEditSheet = (category: Category) => {
    setEditingCategory(category);
    setIsEditSheetOpen(true);
  };

  const renderCategoryCards = (cats: Category[]) => {
    if (cats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border rounded-lg border-dashed bg-card">
          <LucideIcons.FolderOpen className="w-12 h-12 mb-4 opacity-55 animate-pulse" />
          <h3 className="font-semibold text-lg">No Categories Yet</h3>
          <p className="text-sm mt-1 mb-4">Create a new category to group your transactions.</p>
          <Button onClick={openAddSheet}>Add Category</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map((category) => {
          const budget = category.budget;
          const isOverdue = budget && Number(category.total_spent) > Number(budget.amount_limit);

          return (
            <Card
              key={category.id}
              className="group relative overflow-hidden rounded-xl border border-border/40 bg-card hover:bg-card/90 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--shadow-color)] hover:-translate-y-0.5"
              style={{ '--shadow-color': `${category.color || '#3b82f6'}15` } as React.CSSProperties}
            >
              {/* Ambient Background Glow */}
              <div 
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: category.color || '#3b82f6' }}
              />

              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    style={{ 
                      backgroundColor: `${category.color || '#3b82f6'}15`, 
                      color: category.color || 'inherit',
                      border: `1px solid ${category.color || '#3b82f6'}30`
                    }}
                  >
                    <DynamicIcon name={category.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold leading-none">{category.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 capitalize">{category.type}</CardDescription>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/80">
                      <IconDotsVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditSheet(category)}>
                      <IconEdit className="mr-2 h-4 w-4" /> Edit Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="pt-2 pb-4">
                {category.type === 'expense' ? (
                  budget ? (
                    <div className="space-y-4 pt-1">
                      {/* Budget stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground block">Spent ({budget.period})</span>
                          <span className="text-sm font-semibold tabular-nums text-red-500">
                            {formatCurrency(category.total_spent)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">Limit</span>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(budget.amount_limit)}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Percentage</span>
                          <span className={isOverdue ? 'text-destructive font-bold animate-pulse' : 'font-medium'}>
                            {category.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${Math.min(category.progress, 100)}%`,
                              backgroundColor: category.color || '#3b82f6',
                              boxShadow: `0 0 8px ${category.color || '#3b82f6'}40`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center bg-muted/10 transition-colors group-hover:bg-muted/20">
                      <span className="text-xs text-muted-foreground/80 mb-2">Budget limit not defined yet</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditSheet(category)}
                        className="h-8 text-xs"
                      >
                        <IconPlus className="mr-1 h-3.5 w-3.5" /> Set Budget Limit
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="py-5 flex flex-col items-center justify-center text-muted-foreground text-xs">
                    <IconCoins className="h-6 w-6 mb-1.5 text-green-500/80" />
                    Income categories do not require budget limits.
                  </div>
                )}
              </CardContent>

              {category.type === 'expense' && budget && (
                <CardFooter className="bg-muted/10 border-t border-border/30 py-3 text-xs flex justify-between text-muted-foreground">
                  {isOverdue ? (
                    <span className="flex items-center gap-1 text-destructive font-semibold">
                      <IconAlertTriangle className="h-3.5 w-3.5" /> Limit exceeded by {formatCurrency(Number(category.total_spent) - Number(budget.amount_limit))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/85">
                      Remaining: <strong className="font-semibold text-foreground/90">{formatCurrency(Math.max(Number(budget.amount_limit) - Number(category.total_spent), 0))}</strong>
                    </span>
                  )}
                  <span className="capitalize text-xs text-muted-foreground/60">{budget.period}</span>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Head title="Categories & Budgets" />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Categories & Budgets</h1>
                <p className="text-muted-foreground">Manage transaction categories and monthly budgets allocation.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card h-9"
                  />
                </div>
                <Button size="sm" onClick={openAddSheet}>
                  <IconPlus className="mr-1 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <CollapsibleSummary>
              <SummaryCards stats={stats} formatCurrency={formatCurrency} />
            </CollapsibleSummary>

            {/* Tabs & Content */}
            <Tabs defaultValue="expense" className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <TabsList className="bg-muted">
                  <TabsTrigger value="expense">Expenses</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="expense" className="mt-0 space-y-4">
                {renderCategoryCards(expenseCategories)}
              </TabsContent>

              <TabsContent value="income" className="mt-0 space-y-4">
                {renderCategoryCards(incomeCategories)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <CategorySheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        mode="add"
      />

      <CategorySheet
        isOpen={isEditSheetOpen}
        onOpenChange={(open) => {
          setIsEditSheetOpen(open);
          if (!open) setEditingCategory(null);
        }}
        mode="edit"
        category={editingCategory}
      />
    </>
  );
}

CategoriesIndex.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>
    {page}
  </AppLayout>
);
