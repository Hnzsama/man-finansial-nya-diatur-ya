import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import * as LucideIcons from 'lucide-react';
import {
  IconChartPie,
  IconCheck,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
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
  SheetFooter,
} from '@/components/ui/sheet';
import { store, update, destroy } from '@/actions/App/Http/Controllers/CategoryController';

interface Budget {
  id: number;
  amount_limit: number | string;
  period: string;
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

interface CategorySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  category?: Category | null;
  onSuccess?: () => void;
}

const AVAILABLE_ICONS = [
  'Folder', 'Banknote', 'Briefcase', 'TrendingUp', 'Utensils', 
  'Car', 'Home', 'Zap', 'Film', 'ShoppingBag', 'Heart',
  'Coffee', 'Smartphone', 'Plane', 'Book', 'Gift', 'Trophy', 'Sparkles'
];

const PRESET_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Slate', hex: '#64748b' },
];

const DynamicIcon = ({ name, className }: { name?: string | null; className?: string }) => {
  if (!name || !(name in LucideIcons)) {
    return <LucideIcons.Folder className={className} />;
  }
  const IconComponent = (LucideIcons as any)[name];
  return <IconComponent className={className} />;
};

export function CategorySheet({ isOpen, onOpenChange, mode, category, onSuccess }: CategorySheetProps) {
  const form = useForm({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'Folder',
    color: '#3b82f6',
    amount_limit: '',
    period: 'monthly',
  });

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        form.setData({
          name: category.name,
          type: category.type,
          icon: category.icon || 'Folder',
          color: category.color || '#3b82f6',
          amount_limit: category.budget ? category.budget.amount_limit.toString() : '',
          period: category.budget ? category.budget.period : 'monthly',
        });
      } else {
        form.reset();
      }
    }
  }, [isOpen, mode, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'add') {
      form.post(store.url(), {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          toast.success('Category successfully added');
          onSuccess?.();
        },
      });
    } else if (mode === 'edit' && category) {
      form.patch(update.url(category.id), {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          toast.success('Category successfully updated');
          onSuccess?.();
        },
      });
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!category) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!category) return;
    form.delete(destroy.url(category.id), {
      onSuccess: () => {
        onOpenChange(false);
        toast.success('Category successfully deleted');
        onSuccess?.();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === 'add' ? 'Add New Category' : 'Edit Category & Budget'}</SheetTitle>
          <SheetDescription>
            {mode === 'add' 
              ? 'Create a new transaction category and its budget limit.' 
              : 'Update category parameters and its budget limit.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              placeholder="e.g. Monthly Grocery, Main Salary"
              required
            />
            {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-type">Transaction Type</Label>
            <Select
              value={form.data.type}
              onValueChange={(v: 'income' | 'expense') => form.setData('type', v)}
            >
              <SelectTrigger id="category-type">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            {form.errors.type && <p className="text-xs text-destructive">{form.errors.type}</p>}
          </div>

          {/* Budget Fields - Render conditionally for expense category */}
          {form.data.type === 'expense' && (
            <div className="p-4 border rounded-xl bg-muted/30 space-y-4 border-border/80">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <IconChartPie className="h-4.5 w-4.5 text-primary" />
                Budget Limit Plan
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount-limit">Monthly Limit (IDR)</Label>
                  <AmountInput
                    id="amount-limit"
                    value={form.data.amount_limit}
                    onChange={(val) => form.setData('amount_limit', val)}
                    placeholder={mode === 'edit' ? 'No budget limit' : 'e.g. 1.000.000'}
                  />
                  {form.errors.amount_limit && <p className="text-xs text-destructive">{form.errors.amount_limit}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Plan Period</Label>
                  <Select
                    value={form.data.period}
                    onValueChange={(v) => form.setData('period', v)}
                  >
                    <SelectTrigger id="period">
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.errors.period && <p className="text-xs text-destructive">{form.errors.period}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-icon">Icon</Label>
            <Select value={form.data.icon} onValueChange={(v) => form.setData('icon', v)}>
              <SelectTrigger id="category-icon">
                <SelectValue placeholder="Select Icon" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <div className="flex items-center gap-2">
                      <DynamicIcon name={icon} className="w-4 h-4" />
                      <span>{icon}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color Accent</Label>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  className="h-8 rounded-lg border border-border flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: preset.hex }}
                  onClick={() => form.setData('color', preset.hex)}
                >
                  {form.data.color === preset.hex && <IconCheck className="h-4 w-4 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          <SheetFooter className="p-0 pt-4 gap-2 flex-col sm:flex-row">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={form.processing}
              >
                Delete Category
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={form.processing}>
              {form.processing ? 'Saving...' : 'Save Category'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
      {category && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Hapus Kategori"
          description={`Apakah Anda yakin ingin menghapus kategori "${category.name}"? Semua transaksi yang terkait akan kehilangan kategorinya.`}
          onConfirm={confirmDelete}
        />
      )}
    </Sheet>
  );
}
export { DynamicIcon };
