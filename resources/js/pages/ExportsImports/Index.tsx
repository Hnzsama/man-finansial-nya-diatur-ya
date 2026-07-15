import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as exportsIndex } from '@/actions/App/Http/Controllers/ExportImportController';
import { ExportPanel } from './components/export-panel';
import { ImportPanel } from './components/import-panel';

interface Wallet {
  id: number;
  name: string;
  current_balance: number | string;
}

interface PageProps {
  wallets: Wallet[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Export & Import', href: exportsIndex.url() }];

export default function ExportsImportsIndex({ wallets }: PageProps) {
  return (
    <>
      <Head title="Export & Import Data" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Data Library Export &amp; Import</h2>
              <p className="text-sm text-muted-foreground font-light">
                Backup your financial statements or upload banking transaction CSV statements.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <ExportPanel wallets={wallets} />
              <ImportPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ExportsImportsIndex.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
