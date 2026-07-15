import { IconEdit } from '@tabler/icons-react';

export interface LogItem {
  id: number;
  transaction_id: number;
  user_id: number;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  transaction?: { id: number; amount: string | number; notes: string | null };
}

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export function LogItem({ log }: { log: LogItem }) {
  return (
    <div className="relative">
      <span className="absolute -left-[35px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 ring-4 ring-background">
        <IconEdit className="h-2 w-2" />
      </span>
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="text-sm font-semibold text-foreground/90">
            Transaction field <code className="text-xs text-primary font-mono bg-primary/5 px-1 py-0.5 rounded">{log.field_changed}</code> was modified
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">{formatDateTime(log.created_at)}</span>
        </div>
        <p className="text-xs text-muted-foreground font-light">
          Linked Transaction: ID #{log.transaction_id}
          {log.transaction?.notes ? ` ("${log.transaction.notes}")` : ''}
        </p>
        <div className="grid grid-cols-2 gap-4 mt-2 p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Before</span>
            <span className="text-muted-foreground line-through font-mono break-all">
              {log.old_value !== null ? log.old_value : '[empty]'}
            </span>
          </div>
          <div className="border-l border-border/40 pl-4">
            <span className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 tracking-wider block mb-0.5">After</span>
            <span className="text-green-600 dark:text-green-400 font-bold font-mono break-all">
              {log.new_value !== null ? log.new_value : '[empty]'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
