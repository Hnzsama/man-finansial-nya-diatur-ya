import { IconReceipt } from '@tabler/icons-react';
import { ReceiptCard, type ReceiptItem } from './receipt-card';

interface ReceiptGridProps {
  receipts: {
    data: ReceiptItem[];
    total: number;
  };
}

export function ReceiptGrid({ receipts }: ReceiptGridProps) {
  if (receipts.data.length === 0) {
    return (
      <div className="bg-card/30 border border-border/50 rounded-2xl p-12 text-center text-muted-foreground shadow-sm flex flex-col items-center justify-center">
        <IconReceipt className="h-10 w-10 text-muted-foreground/60 mb-3" />
        <p className="text-sm">No receipt records found.</p>
        <p className="text-xs text-muted-foreground/60 font-light mt-1">
          Log your expenses under Transactions to view billing receipts in this vault.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {receipts.data.map(receipt => (
          <ReceiptCard key={receipt.id} receipt={receipt} />
        ))}
      </div>
      {receipts.total > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4">
          <div>
            Showing <span className="font-semibold text-foreground">{receipts.data.length}</span> of{' '}
            <span className="font-semibold text-foreground">{receipts.total}</span> files.
          </div>
        </div>
      )}
    </>
  );
}
