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
import { store as assetStore, update as assetUpdate, destroy as assetDestroy } from '@/actions/App/Http/Controllers/AssetController';

interface Asset {
  id: number;
  name: string;
  type: 'savings' | 'deposit' | 'gold' | 'stock' | 'crypto' | 'property';
  current_value: number | string;
  notes: string | null;
}

interface AssetSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  asset?: Asset | null;
  onSuccess?: () => void;
}

export function AssetSheet({
  isOpen,
  onOpenChange,
  mode,
  asset,
  onSuccess,
}: AssetSheetProps) {
  const form = useForm({
    name: '',
    type: 'savings' as 'savings' | 'deposit' | 'gold' | 'stock' | 'crypto' | 'property',
    current_value: '',
    notes: '',
  });

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && asset) {
        form.setData({
          name: asset.name,
          type: asset.type,
          current_value: asset.current_value.toString(),
          notes: asset.notes || '',
        });
      } else {
        form.reset();
      }
    }
  }, [isOpen, mode, asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'add') {
      form.post(assetStore.url(), {
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          toast.success('Asset successfully added.');
          onSuccess?.();
        },
      });
    } else if (mode === 'edit' && asset) {
      form.patch(assetUpdate.url(asset.id), {
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          toast.success('Asset successfully updated.');
          onSuccess?.();
        },
      });
    }
  };

  const handleDelete = () => {
    if (!asset) return;
    if (confirm(`Are you sure you want to delete the asset "${asset.name}"?`)) {
      form.delete(assetDestroy.url(asset.id), {
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false);
          toast.success('Asset successfully deleted.');
          onSuccess?.();
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === 'add' ? 'Add New Asset' : 'Edit Asset'}</SheetTitle>
          <SheetDescription>
            {mode === 'add'
              ? 'Add a new wealth or investment asset to calculate net worth.'
              : 'Modify the properties or notes for this asset.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input
              id="asset-name"
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              placeholder="e.g. Deposito BCA, Saham TLKM"
              required
            />
            {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset-value">Current Value (IDR)</Label>
              <AmountInput
                id="asset-value"
                value={form.data.current_value}
                onChange={(val) => form.setData('current_value', val)}
                placeholder="e.g. 10.000.000"
                required
              />
              {form.errors.current_value && <p className="text-xs text-destructive">{form.errors.current_value}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-type">Asset Type</Label>
              <Select
                value={form.data.type}
                onValueChange={(v: 'savings' | 'deposit' | 'gold' | 'stock' | 'crypto' | 'property') => form.setData('type', v)}
              >
                <SelectTrigger id="asset-type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="deposit">Time Deposit</SelectItem>
                  <SelectItem value="gold">Gold & Metals</SelectItem>
                  <SelectItem value="stock">Stocks / Equities</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="property">Property / Land</SelectItem>
                </SelectContent>
              </Select>
              {form.errors.type && <p className="text-xs text-destructive">{form.errors.type}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-notes">Notes (Optional)</Label>
            <Input
              id="asset-notes"
              value={form.data.notes}
              onChange={(e) => form.setData('notes', e.target.value)}
              placeholder="e.g. certificate number, broker account"
            />
            {form.errors.notes && <p className="text-xs text-destructive">{form.errors.notes}</p>}
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
              {form.processing ? 'Saving...' : 'Save Asset'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
