import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as activityLogsIndex } from '@/actions/App/Http/Controllers/ActivityLogController';
import { LogTimeline } from './components/log-timeline';
import type { LogItem } from './components/log-item';

interface PageProps {
  logs: {
    data: LogItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
  };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Activity Logs', href: activityLogsIndex.url() }];

export default function ActivityLogsIndex({ logs }: PageProps) {
  return (
    <>
      <Head title="Activity & Audit Logs" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Security &amp; Audit logs</h2>
              <p className="text-sm text-muted-foreground font-light">
                Chronological list of updates, edits, and modifications recorded on your transactions database.
              </p>
            </div>
            <LogTimeline logs={logs} />
          </div>
        </div>
      </div>
    </>
  );
}

ActivityLogsIndex.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
