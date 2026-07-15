import { IconReceipt, IconDownload, IconCalendarCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ReceiptItem {
  id: number;
  amount: string | number;
  date: string;
  notes: string | null;
  wallet?: { name: string };
  category?: { name: string };
}

const formatCurrency = (value: number | string) => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

function downloadReceipt(receipt: ReceiptItem) {
  const title = receipt.notes || receipt.category?.name || 'Expense Receipt';
  toast.success(`Downloading receipt for "${title}"...`);
  const content = `
=========================================
          FINANCE STATEMENT RECEIPT
=========================================
Transaction ID: #${receipt.id}
Date:           ${receipt.date}
Category:       ${receipt.category?.name || 'General'}
Account:        ${receipt.wallet?.name || 'Main Wallet'}
Description:    ${title}
Amount:         ${formatCurrency(receipt.amount)}
=========================================
Thank you for keeping your ledgers clean.
=========================================
`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt_invoice_${receipt.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function ReceiptCard({ receipt }: { receipt: ReceiptItem }) {
  const title = receipt.notes || receipt.category?.name || 'Expense Receipt';
  return (
    <div className="group bg-card/40 hover:bg-card/70 border border-border/50 hover:border-primary/40 rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all duration-200 backdrop-blur-xs">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
            <IconReceipt className="h-4 w-4 text-primary" />
          </div>
          <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-semibold">
            {receipt.category?.name || 'General'}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <IconCalendarCheck className="h-3 w-3" />{receipt.date}
          </p>
          <h4 className="text-sm font-semibold truncate leading-tight group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-xs text-muted-foreground/80 truncate">Account: {receipt.wallet?.name || 'Main Wallet'}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-destructive tabular-nums">{formatCurrency(receipt.amount)}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => downloadReceipt(receipt)}
          className="h-7 w-7 text-muted-foreground hover:text-primary rounded-md"
        >
          <IconDownload className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
}
