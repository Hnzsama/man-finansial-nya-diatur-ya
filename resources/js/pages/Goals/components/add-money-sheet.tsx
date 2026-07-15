import React from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { update as goalUpdate } from '@/actions/App/Http/Controllers/GoalController';

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

interface AddMoneySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  formatCurrency: (value: number | string) => string;
  onSuccess?: () => void;
}

export function AddMoneySheet({
  isOpen,
  onOpenChange,
  goal,
  formatCurrency,
  onSuccess,
}: AddMoneySheetProps) {
  const [amount, setAmount] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !amount || Number(amount) <= 0) return;

    const newAmount = Number(goal.current_amount) + Number(amount);

    router.put(
      goalUpdate.url(goal.id),
      {
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: newAmount,
        deadline: goal.deadline,
        color: goal.color,
        icon: goal.icon,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success(`Successfully added ${formatCurrency(amount)} to your savings goal!`);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Savings</SheetTitle>
          <SheetDescription>Record additional savings for goal "{goal?.name}".</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="add-money-amount">Amount to save (IDR)</Label>
            <Input
              id="add-money-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              required
            />
          </div>
          
          {/* Quick value buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 250000, 500000, 1000000, 2000000].map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(val.toString())}
              >
                +{val / 1000}K
              </Button>
            ))}
          </div>

          <SheetFooter className="p-0 pt-6">
            <Button type="submit" className="w-full" disabled={!amount || Number(amount) <= 0}>
              Add to Savings
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
