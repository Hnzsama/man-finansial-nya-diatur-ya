import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
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
import { store as subStore, update as subUpdate, destroy as subDestroy } from '@/actions/App/Http/Controllers/SubscriptionController';

interface Wallet {
  id: number;
  name: string;
  current_balance: number | string;
}

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

interface Subscription {
  id: number;
  wallet_id: number;
  category_id: number | null;
  name: string;
  amount: number | string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_billing_date: string;
  is_active: boolean;
  notes: string | null;
  wallet?: Wallet;
  category?: Category | null;
}

interface SubscriptionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  subscription?: Subscription | null;
  wallets: Wallet[];
  categories: Category[];
  formatCurrency: (value: number | string) => string;
  onSuccess?: () => void;
}

export function SubscriptionSheet({
  isOpen,
  onOpenChange,
  mode,
  subscription,
  wallets,
  categories,
  formatCurrency,
  onSuccess,
}: SubscriptionSheetProps) {
  const form = useForm({
    name: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    next_billing_date: new Date().toISOString().split('T')[0],
    wallet_id: wallets[0]?.id?.toString() || '',
    category_id: '',
    is_active: true,
    notes: '',
  });

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && subscription) {
        form.setData({
          name: subscription.name,
          amount: subscription.amount.toString(),
          frequency: subscription.frequency,
          next_billing_date: subscription.next_billing_date.split('T')[0],
          wallet_id: subscription.wallet_id.toString(),
          category_id: subscription.category_id ? subscription.category_id.toString() : '',
          is_active: subscription.is_active,
          notes: subscription.notes || '',
        });
      } else {
        form.reset();
        form.setData('wallet_id', wallets[0]?.id?.toString() || '');
      }
    }
  }, [isOpen, mode, subscription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'add') {
      form.post(subStore.url(), {
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          toast.success('Subscription successfully created.');
          onSuccess?.();
        },
      });
    } else if (mode === 'edit' && subscription) {
      form.patch(subUpdate.url(subscription.id), {
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          toast.success('Subscription successfully updated.');
          onSuccess?.();
        },
      });
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!subscription) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!subscription) return;
    form.delete(subDestroy.url(subscription.id), {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false);
        toast.success('Subscription successfully deleted.');
        onSuccess?.();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === 'add' ? 'Add New Subscription' : 'Edit Subscription'}</SheetTitle>
          <SheetDescription>
            {mode === 'add'
              ? 'Record a new recurring bill or service subscription.'
              : 'Modify parameters of your active subscription.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="sub-name">Subscription Name</Label>
            <Input
              id="sub-name"
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              placeholder="e.g. Netflix Premium, House Electricity"
              required
            />
            {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-amount">Billing Amount (IDR)</Label>
              <AmountInput
                id="sub-amount"
                value={form.data.amount}
                onChange={(val) => form.setData('amount', val)}
                placeholder="e.g. 186.000"
                required
              />
              {form.errors.amount && <p className="text-xs text-destructive">{form.errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub-frequency">Billing Frequency</Label>
              <Select
                value={form.data.frequency}
                onValueChange={(v: 'daily' | 'weekly' | 'monthly' | 'yearly') => form.setData('frequency', v)}
              >
                <SelectTrigger id="sub-frequency">
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {form.errors.frequency && <p className="text-xs text-destructive">{form.errors.frequency}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-billing-date">Next Billing Date</Label>
            <Input
              id="sub-billing-date"
              type="date"
              value={form.data.next_billing_date}
              onChange={(e) => form.setData('next_billing_date', e.target.value)}
              required
            />
            {form.errors.next_billing_date && <p className="text-xs text-destructive">{form.errors.next_billing_date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-wallet-id">Source Wallet</Label>
              <Select
                value={form.data.wallet_id}
                onValueChange={(v) => form.setData('wallet_id', v)}
              >
                <SelectTrigger id="sub-wallet-id">
                  <SelectValue placeholder="Select Wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name} ({formatCurrency(w.current_balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.errors.wallet_id && <p className="text-xs text-destructive">{form.errors.wallet_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub-category-id">Category (Optional)</Label>
              <Select
                value={form.data.category_id}
                onValueChange={(v) => form.setData('category_id', v)}
              >
                <SelectTrigger id="sub-category-id">
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.errors.category_id && <p className="text-xs text-destructive">{form.errors.category_id}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-notes">Additional Notes (Optional)</Label>
            <Input
              id="sub-notes"
              value={form.data.notes}
              onChange={(e) => form.setData('notes', e.target.value)}
              placeholder="e.g. billing account ID, discount codes"
            />
            {form.errors.notes && <p className="text-xs text-destructive">{form.errors.notes}</p>}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20 border-border/80">
            <div className="space-y-0.5">
              <Label htmlFor="sub-is-active" className="text-sm font-semibold">Active Status</Label>
              <span className="text-[11px] text-muted-foreground block">
                Whether this subscription is active and processed on billing date
              </span>
            </div>
            <input
              id="sub-is-active"
              type="checkbox"
              checked={form.data.is_active}
              onChange={(e) => form.setData('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          <SheetFooter className="p-0 pt-4 gap-2 flex-col sm:flex-row">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={form.processing}
              >
                Delete
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={form.processing}>
              {form.processing ? 'Saving...' : 'Save Subscription'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
      {subscription && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Hapus Langganan"
          description={`Apakah Anda yakin ingin menghapus langganan "${subscription.name}"? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={confirmDelete}
        />
      )}
    </Sheet>
  );
}
