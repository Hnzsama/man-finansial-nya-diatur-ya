import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn, localTodayString, parseLocalDate } from '@/lib/utils';
import { IconCalendar } from '@tabler/icons-react';
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
  current_balance: number | string;
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
  const [paymentType, setPaymentType] = React.useState<'full' | 'installment'>('full');

  const form = useForm({
    amount: '',
    wallet_id: wallets[0]?.id?.toString() || '',
    date: localTodayString(),
    notes: '',
  });

  React.useEffect(() => {
    if (isOpen) {
      setPaymentType('full');
      form.setData({
        amount: debt ? debt.remaining_amount.toString() : '',
        wallet_id: wallets[0]?.id?.toString() || '',
        date: localTodayString(),
        notes: '',
      });
    }
  }, [isOpen, debt]);

  const handlePaymentTypeChange = (type: 'full' | 'installment') => {
    setPaymentType(type);
    if (type === 'full') {
      form.setData('amount', debt ? debt.remaining_amount.toString() : '');
    } else {
      form.setData('amount', '');
    }
  };

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

  const remainingShortage = debt
    ? Math.max(0, Number(debt.remaining_amount) - Number(form.data.amount || 0))
    : 0;

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
            <Label>Cara Pembayaran</Label>
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
              <button
                type="button"
                className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  paymentType === 'full'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => handlePaymentTypeChange('full')}
              >
                Bayar Lunas
              </button>
              <button
                type="button"
                className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  paymentType === 'installment'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => handlePaymentTypeChange('installment')}
              >
                Cicil
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-amount">Jumlah Pembayaran (IDR)</Label>
            <AmountInput
              id="pay-amount"
              value={form.data.amount}
              onChange={(val) => form.setData('amount', val)}
              placeholder="e.g. 500.000"
              required
              disabled={paymentType === 'full'}
            />
            {form.errors.amount && <p className="text-xs text-destructive">{form.errors.amount}</p>}
          </div>

          {debt && (
            <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Debt:</span>
                <span className="font-semibold">{formatCurrency(debt.remaining_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Payment:</span>
                <span className="font-semibold text-emerald-500">
                  -{formatCurrency(form.data.amount || 0)}
                </span>
              </div>
              <div className="border-t border-border/30 my-1 pt-1 flex justify-between font-medium">
                <span className="text-muted-foreground">Remaining Shortage:</span>
                <span className={remainingShortage > 0 ? "text-orange-500 font-bold" : "text-emerald-500 font-bold"}>
                  {formatCurrency(remainingShortage)}
                </span>
              </div>
            </div>
          )}

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
                    {w.name} ({formatCurrency(w.current_balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.wallet_id && <p className="text-xs text-destructive">{form.errors.wallet_id}</p>}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="pay-date">Transaction Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="pay-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-input",
                    !form.data.date && "text-muted-foreground"
                  )}
                >
                  <IconCalendar className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                  {form.data.date ? (
                    format(parseLocalDate(form.data.date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.data.date ? parseLocalDate(form.data.date) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      form.setData('date', `${year}-${month}-${day}`);
                    } else {
                      form.setData('date', '');
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
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

