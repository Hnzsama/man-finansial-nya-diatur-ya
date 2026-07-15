import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as receiptsIndex } from '@/actions/App/Http/Controllers/ReceiptController';
import { ReceiptGrid } from './components/receipt-grid';
import type { ReceiptItem } from './components/receipt-card';

interface PageProps {
  receipts: {
    data: ReceiptItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
  };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Receipts & Invoices', href: receiptsIndex.url() }];

export default function ReceiptsIndex({ receipts }: PageProps) {
  return (
    <>
      <Head title="Receipts & Invoices" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Receipts &amp; Invoices Vault</h2>
              <p className="text-sm text-muted-foreground font-light">
                Digital records of cash register receipts, billing statements, and payments.
              </p>
            </div>
            <ReceiptGrid receipts={receipts} />
          </div>
        </div>
      </div>
    </>
  );
}

ReceiptsIndex.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
