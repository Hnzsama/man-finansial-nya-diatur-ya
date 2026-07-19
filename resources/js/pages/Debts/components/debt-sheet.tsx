import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  IconUser,
  IconCalendar,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
import { store as debtStore, update as debtUpdate, destroy as debtDestroy } from '@/actions/App/Http/Controllers/DebtController';

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

interface DebtSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  debt?: Debt | null;
  wallets: Wallet[];
  formatCurrency: (value: number | string) => string;
  onSuccess?: () => void;
}

export function DebtSheet({
  isOpen,
  onOpenChange,
  mode,
  debt,
  wallets,
  formatCurrency,
  onSuccess,
}: DebtSheetProps) {
  const form = useForm({
    type: 'payable' as 'payable' | 'receivable',
    counterparty_name: '',
    amount: '',
    due_date: '',
    notes: '',
    wallet_id: '',
    link_wallet: false,
  });

  const editForm = useForm({
    counterparty_name: '',
    due_date: '',
    notes: '',
  });

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && debt) {
        editForm.setData({
          counterparty_name: debt.counterparty_name,
          due_date: debt.due_date || '',
          notes: debt.notes || '',
        });
      } else {
        form.reset();
      }
    }
  }, [isOpen, mode, debt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'add') {
      form.post(debtStore.url(), {
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        },
      });
    } else if (mode === 'edit' && debt) {
      editForm.put(debtUpdate.url(debt.id), {
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false);
          editForm.reset();
          onSuccess?.();
        },
      });
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!debt) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!debt) return;
    editForm.delete(debtDestroy.url(debt.id), {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  const processing = mode === 'add' ? form.processing : editForm.processing;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === 'add' ? 'Record New Loan' : 'Edit Loan Details'}</SheetTitle>
          <SheetDescription>
            {mode === 'add'
              ? 'Save details of the new loan here.'
              : 'Update contact or due date parameters for this loan.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {mode === 'add' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="add-type">Record Type</Label>
                <Select
                  value={form.data.type}
                  onValueChange={(v: 'payable' | 'receivable') => form.setData('type', v)}
                >
                  <SelectTrigger id="add-type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payable">Debt (I borrow money)</SelectItem>
                    <SelectItem value="receivable">Loan (I lend money)</SelectItem>
                  </SelectContent>
                </Select>
                {form.errors.type && <p className="text-xs text-destructive">{form.errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-counterparty">Contact Name</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="add-counterparty"
                    className="pl-9"
                    value={form.data.counterparty_name}
                    onChange={(e) => form.setData('counterparty_name', e.target.value)}
                    placeholder="e.g. John Doe, Bank ABC"
                    required
                  />
                </div>
                {form.errors.counterparty_name && <p className="text-xs text-destructive">{form.errors.counterparty_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-amount">Amount (IDR)</Label>
                <AmountInput
                  id="add-amount"
                  value={form.data.amount}
                  onChange={(val) => form.setData('amount', val)}
                  placeholder="e.g. 5.000.000"
                  required
                />
                {form.errors.amount && <p className="text-xs text-destructive">{form.errors.amount}</p>}
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="add-due-date">Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="add-due-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-input",
                        !form.data.due_date && "text-muted-foreground"
                      )}
                    >
                      <IconCalendar className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                      {form.data.due_date ? (
                        format(new Date(form.data.due_date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.data.due_date ? new Date(form.data.due_date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          form.setData('due_date', `${year}-${month}-${day}`);
                        } else {
                          form.setData('due_date', '');
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {form.errors.due_date && <p className="text-xs text-destructive">{form.errors.due_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-notes">Additional Notes (Optional)</Label>
                <Input
                  id="add-notes"
                  value={form.data.notes}
                  onChange={(e) => form.setData('notes', e.target.value)}
                  placeholder="e.g. 0% interest, loan for business modal"
                />
                {form.errors.notes && <p className="text-xs text-destructive">{form.errors.notes}</p>}
              </div>

              {/* Toggle to connect to Wallet */}
              {wallets.length > 0 && (
                <div className="p-4 border rounded-xl bg-muted/20 space-y-4 border-border/80">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="add-link-wallet" className="text-sm font-semibold">Connect with Wallet</Label>
                      <span className="text-[11px] text-muted-foreground block">
                        Automatically log transactions in the selected wallet
                      </span>
                    </div>
                    <input
                      id="add-link-wallet"
                      type="checkbox"
                      checked={form.data.link_wallet}
                      onChange={(e) => form.setData('link_wallet', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>

                  {form.data.link_wallet && (
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <Label htmlFor="add-wallet-id">Source/Destination Wallet</Label>
                      <Select
                        value={form.data.wallet_id}
                        onValueChange={(v) => form.setData('wallet_id', v)}
                      >
                        <SelectTrigger id="add-wallet-id">
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
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-counterparty">Contact Name</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-counterparty"
                    className="pl-9"
                    value={editForm.data.counterparty_name}
                    onChange={(e) => editForm.setData('counterparty_name', e.target.value)}
                    required
                  />
                </div>
                {editForm.errors.counterparty_name && <p className="text-xs text-destructive">{editForm.errors.counterparty_name}</p>}
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="edit-due-date">Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-due-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-input",
                        !editForm.data.due_date && "text-muted-foreground"
                      )}
                    >
                      <IconCalendar className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                      {editForm.data.due_date ? (
                        format(new Date(editForm.data.due_date as string), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editForm.data.due_date ? new Date(editForm.data.due_date as string) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          editForm.setData('due_date', `${year}-${month}-${day}`);
                        } else {
                          editForm.setData('due_date', '');
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {editForm.errors.due_date && <p className="text-xs text-destructive">{editForm.errors.due_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Additional Notes (Optional)</Label>
                <Input
                  id="edit-notes"
                  value={editForm.data.notes}
                  onChange={(e) => editForm.setData('notes', e.target.value)}
                />
                {editForm.errors.notes && <p className="text-xs text-destructive">{editForm.errors.notes}</p>}
              </div>
            </>
          )}

          <SheetFooter className="p-0 pt-4 gap-2 flex-col sm:flex-row">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={processing}
              >
                Delete Loan
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={processing}>
              {processing ? 'Saving...' : mode === 'add' ? 'Save Loan' : 'Update Details'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
      {debt && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Debt / Loan"
          description={`Are you sure you want to delete the debt/loan record for "${debt.counterparty_name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
        />
      )}
    </Sheet>
  );
}
