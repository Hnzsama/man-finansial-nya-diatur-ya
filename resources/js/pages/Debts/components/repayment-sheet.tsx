import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { recordPayment as debtPayment } from '@/actions/App/Http/Controllers/DebtController';

interface Debt {
  id: number;
  type: 'payable' | 'receivable';
  counterparty_name: string;
  amount: number | string;
  remaining_amount: number | string;
  due_date: string | null;
  notes: string | null;
  status: 'active' | 'paid_off' | 'cancelled';
  progress: number;
  created_at: string;
}

interface Wallet {
  id: number;
  name: string;
  balance: number | string;
}

interface RepaymentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  wallets: Wallet[];
  formatCurrency: (value: number | string) => string;
  onSuccess?: () => void;
}

export function RepaymentSheet({
  isOpen,
  onOpenChange,
  debt,
  wallets,
  formatCurrency,
  onSuccess,
}: RepaymentSheetProps) {
  const form = useForm({
    amount: '',
    wallet_id: wallets[0]?.id?.toString() || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  React.useEffect(() => {
    if (isOpen) {
      form.setData({
        amount: '',
        wallet_id: wallets[0]?.id?.toString() || '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;

    form.post(debtPayment.url(debt.id), {
      preserveScroll: true,
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
          <SheetTitle>
            {debt?.type === 'payable' ? 'Pay Installment' : 'Receive Payment'}
          </SheetTitle>
          <SheetDescription>
            Record payment installment for {debt?.counterparty_name}. Current remaining balance is{' '}
            <strong className="text-foreground">{debt ? formatCurrency(debt.remaining_amount) : ''}</strong>.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="pay-amount">Payment Amount (IDR)</Label>
            <Input
              id="pay-amount"
              type="number"
              max={debt ? Number(debt.remaining_amount) : undefined}
              value={form.data.amount}
              onChange={(e) => form.setData('amount', e.target.value)}
              placeholder="e.g. 500000"
              required
            />
            {form.errors.amount && <p className="text-xs text-destructive">{form.errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-wallet-id">Transaction Wallet</Label>
            <Select
              value={form.data.wallet_id}
              onValueChange={(v) => form.setData('wallet_id', v)}
            >
              <SelectTrigger id="pay-wallet-id">
                <SelectValue placeholder="Select Wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name} ({formatCurrency(w.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.wallet_id && <p className="text-xs text-destructive">{form.errors.wallet_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-date">Transaction Date</Label>
            <Input
              id="pay-date"
              type="date"
              value={form.data.date}
              onChange={(e) => form.setData('date', e.target.value)}
              required
            />
            {form.errors.date && <p className="text-xs text-destructive">{form.errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-notes">Description / Memo (Optional)</Label>
            <Input
              id="pay-notes"
              value={form.data.notes}
              onChange={(e) => form.setData('notes', e.target.value)}
              placeholder="e.g. Installment for this month"
            />
            {form.errors.notes && <p className="text-xs text-destructive">{form.errors.notes}</p>}
          </div>

          <SheetFooter className="p-0 pt-4">
            <Button type="submit" className="w-full" disabled={form.processing}>
              {form.processing ? 'Saving...' : 'Record Payment'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
