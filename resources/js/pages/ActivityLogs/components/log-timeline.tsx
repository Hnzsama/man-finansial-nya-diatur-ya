import { IconHistory } from '@tabler/icons-react';
import { LogItem, type LogItem as LogItemType } from './log-item';

interface LogTimelineProps {
  logs: {
    data: LogItemType[];
    total: number;
  };
}

export function LogTimeline({ logs }: LogTimelineProps) {
  return (
    <div className="bg-card/30 border border-border/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
      {logs.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <IconHistory className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <p className="text-sm">No transaction modification logs recorded yet.</p>
          <p className="text-xs text-muted-foreground/60 font-light mt-1">
            When you edit or update existing transactions, audit logs will be listed here.
          </p>
        </div>
      ) : (
        <div className="relative border-l border-border/50 ml-4 pl-6 space-y-6">
          {logs.data.map(log => <LogItem key={log.id} log={log} />)}
        </div>
      )}

      {logs.total > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-6 mt-6 border-t border-border/50">
          <div>
            Showing <span className="font-semibold text-foreground">{logs.data.length}</span> of{' '}
            <span className="font-semibold text-foreground">{logs.total}</span> history logs.
          </div>
        </div>
      )}
    </div>
  );
}
