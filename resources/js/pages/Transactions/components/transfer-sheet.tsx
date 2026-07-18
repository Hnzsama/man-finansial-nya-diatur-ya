import React from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
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
import { store as transferStore } from '@/actions/App/Http/Controllers/TransferController';

interface Wallet {
  id: number;
  name: string;
  current_balance: number | string;
}

interface TransferSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: Wallet[];
  onSuccess?: () => void;
}

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue);
};

export function TransferSheet({
  isOpen,
  onOpenChange,
  wallets,
  onSuccess,
}: TransferSheetProps) {
  const form = useForm({
    from_wallet_id: '',
    to_wallet_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset();
      if (wallets.length > 0) {
        form.setData({
          from_wallet_id: wallets[0].id.toString(),
          to_wallet_id: wallets[1] ? wallets[1].id.toString() : '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    form.post(transferStore.url(), {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        toast.success('Funds successfully transferred.');
        onSuccess?.();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transfer Funds</SheetTitle>
          <SheetDescription>
            Move balance from one wallet account to another.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="from-wallet">Source Wallet (From)</Label>
            <Select
              value={form.data.from_wallet_id}
              onValueChange={(v) => form.setData('from_wallet_id', v)}
            >
              <SelectTrigger id="from-wallet">
                <SelectValue placeholder="Select Source Wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name} ({formatCurrency(w.current_balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.from_wallet_id && <p className="text-xs text-destructive">{form.errors.from_wallet_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-wallet">Destination Wallet (To)</Label>
            <Select
              value={form.data.to_wallet_id}
              onValueChange={(v) => form.setData('to_wallet_id', v)}
            >
              <SelectTrigger id="to-wallet">
                <SelectValue placeholder="Select Destination Wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.filter((w) => w.id.toString() !== form.data.from_wallet_id).map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name} ({formatCurrency(w.current_balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.to_wallet_id && <p className="text-xs text-destructive">{form.errors.to_wallet_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-amount">Amount (IDR)</Label>
            <AmountInput
              id="transfer-amount"
              value={form.data.amount}
              onChange={(val) => form.setData('amount', val)}
              placeholder="e.g. 500.000"
              required
            />
            {form.errors.amount && <p className="text-xs text-destructive">{form.errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-date">Date</Label>
            <Input
              id="transfer-date"
              type="date"
              value={form.data.date}
              onChange={(e) => form.setData('date', e.target.value)}
              required
            />
            {form.errors.date && <p className="text-xs text-destructive">{form.errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-notes">Notes (Optional)</Label>
            <Input
              id="transfer-notes"
              value={form.data.notes}
              onChange={(e) => form.setData('notes', e.target.value)}
              placeholder="e.g. cash deposit, ATM transfer"
            />
            {form.errors.notes && <p className="text-xs text-destructive">{form.errors.notes}</p>}
          </div>

          <SheetFooter className="p-0 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={form.processing || !form.data.from_wallet_id || !form.data.to_wallet_id || !form.data.amount}
            >
              {form.processing ? 'Transferring...' : 'Transfer Balance'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
