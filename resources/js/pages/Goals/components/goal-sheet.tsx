import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
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
import { store as goalStore, update as goalUpdate, destroy as goalDestroy } from '@/actions/App/Http/Controllers/GoalController';

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

interface GoalSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  goal?: Goal | null;
  onSuccess?: () => void;
}

const GOAL_ICONS = {
  Target: LucideIcons.Target,
  PiggyBank: LucideIcons.PiggyBank,
  Trophy: LucideIcons.Trophy,
  Sparkles: LucideIcons.Sparkles,
  GraduationCap: LucideIcons.GraduationCap,
  Home: LucideIcons.Home,
  Car: LucideIcons.Car,
  Smartphone: LucideIcons.Smartphone,
  Heart: LucideIcons.Heart,
  Briefcase: LucideIcons.Briefcase,
  Gift: LucideIcons.Gift,
  Plane: LucideIcons.Plane,
};

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

const DynamicIcon = ({ name, className }: { name: string | null; className?: string }) => {
  if (!name || !(name in GOAL_ICONS)) {
    return <LucideIcons.Target className={className} />;
  }
  const IconComponent = GOAL_ICONS[name as keyof typeof GOAL_ICONS];
  return <IconComponent className={className} />;
};

export function GoalSheet({ isOpen, onOpenChange, mode, goal, onSuccess }: GoalSheetProps) {
  const form = useForm({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: '',
    color: '#3b82f6',
    icon: 'Target',
  });

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && goal) {
        form.setData({
          name: goal.name,
          target_amount: goal.target_amount.toString(),
          current_amount: goal.current_amount.toString(),
          deadline: goal.deadline || '',
          color: goal.color || '#3b82f6',
          icon: goal.icon || 'Target',
        });
      } else {
        form.reset();
      }
    }
  }, [isOpen, mode, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'add') {
      form.post(goalStore.url(), {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        },
      });
    } else if (mode === 'edit' && goal) {
      form.put(goalUpdate.url(goal.id), {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        },
      });
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!goal) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!goal) return;
    form.delete(goalDestroy.url(goal.id), {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === 'add' ? 'Create New Goal' : 'Edit Savings Goal'}</SheetTitle>
          <SheetDescription>
            {mode === 'add' 
              ? 'Set your financial target and deadline for saving.' 
              : 'Update your savings goal parameters here.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              placeholder="e.g. Emergency Fund, Buy New Laptop"
              required
            />
            {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Amount (IDR)</Label>
              <AmountInput
                id="target-amount"
                value={form.data.target_amount}
                onChange={(val) => form.setData('target_amount', val)}
                placeholder="0"
                required
              />
              {form.errors.target_amount && <p className="text-xs text-destructive">{form.errors.target_amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-amount">Initial Saved Amount (IDR)</Label>
              <AmountInput
                id="current-amount"
                value={form.data.current_amount}
                onChange={(val) => form.setData('current_amount', val)}
                placeholder="0"
                required
              />
              {form.errors.current_amount && <p className="text-xs text-destructive">{form.errors.current_amount}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={form.data.deadline}
              onChange={(e) => form.setData('deadline', e.target.value)}
            />
            {form.errors.deadline && <p className="text-xs text-destructive">{form.errors.deadline}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-icon">Icon</Label>
            <Select value={form.data.icon} onValueChange={(val) => form.setData('icon', val)}>
              <SelectTrigger id="goal-icon">
                <SelectValue placeholder="Select Icon" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(GOAL_ICONS).map((iconName) => (
                  <SelectItem key={iconName} value={iconName}>
                    <div className="flex items-center gap-2">
                      <DynamicIcon name={iconName} className="h-4 w-4" />
                      <span>{iconName}</span>
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
            {form.errors.color && <p className="text-xs text-destructive">{form.errors.color}</p>}
          </div>

          <SheetFooter className="p-0 pt-4 gap-2 flex-col sm:flex-row">
            {mode === 'edit' && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={form.processing}>
                Delete Goal
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={form.processing}>
              {mode === 'add' ? 'Save Goal' : 'Update Goal'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
      {goal && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Goal"
          description={`Are you sure you want to delete the financial goal "${goal.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
        />
      )}
    </Sheet>
  );
}
export { GOAL_ICONS, DynamicIcon };
