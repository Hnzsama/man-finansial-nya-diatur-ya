import { useState } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { IconCloudDownload, IconFileSpreadsheet, IconChartBar, IconCalendar, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { buildXlsXml, type XlsRow } from './xls-builder';
import { buildHtmlReport, type HtmlReportRow } from './html-report-builder';

interface Wallet {
  id: number;
  name: string;
}

interface ExportPanelProps {
  wallets: Wallet[];
  realTransactions: any[];
}

const SAMPLE_ROWS: (XlsRow & HtmlReportRow)[] = [
  { date: '2026-07-01', type: 'expense', amount: 50000, category: 'Food & Dining', wallet: 'Cash', notes: 'Makan siang' },
  { date: '2026-07-05', type: 'expense', amount: 200000, category: 'Transportation', wallet: 'Cash', notes: 'Bensin motor' },
  { date: '2026-07-08', type: 'income', amount: 500000, category: 'Freelance', wallet: 'BCA Wallet', notes: 'Honorarium desain' },
  { date: '2026-07-10', type: 'expense', amount: 350000, category: 'Shopping', wallet: 'BCA Wallet', notes: 'Belanja kebutuhan' },
  { date: '2026-07-12', type: 'expense', amount: 75000, category: 'Entertainment', wallet: 'Cash', notes: 'Nonton bioskop' },
  { date: '2026-07-16', type: 'income', amount: 12000000, category: 'Salary', wallet: 'Savings Wallet', notes: 'Gaji bulanan' },
];

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  const label =
    value?.from && value?.to
      ? `${format(value.from, 'dd MMM yyyy')} — ${format(value.to, 'dd MMM yyyy')}`
      : value?.from
        ? `${format(value.from, 'dd MMM yyyy')} — pilih akhir`
        : 'Pilih rentang tanggal';

  const hasValue = !!value?.from;

  return (
    <div className="space-y-2">
      <Label>Date Range</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-range-picker"
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal text-sm h-9',
                !hasValue && 'text-muted-foreground',
              )}
            >
              <IconCalendar className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{label}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
            <Calendar
              mode="range"
              selected={value}
              onSelect={(range) => {
                onChange(range);
                if (range?.from && range?.to) {
                  setOpen(false);
                }
              }}
              numberOfMonths={2}
              captionLayout="dropdown"
              disabled={{ after: new Date() }}
            />
            <div className="border-t border-border/50 px-3 py-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {value?.from && value?.to
                  ? `${Math.round((value.to.getTime() - value.from.getTime()) / 86400000) + 1} hari dipilih`
                  : 'Klik tanggal mulai lalu akhir'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                Reset
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {hasValue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onChange(undefined)}
            title="Hapus rentang tanggal"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value?.from && value?.to && (
        <p className="text-[11px] text-muted-foreground font-light">
          {format(value.from, 'dd MMMM yyyy')} s/d {format(value.to, 'dd MMMM yyyy')}
        </p>
      )}
    </div>
  );
}

export function ExportPanel({ wallets, realTransactions }: ExportPanelProps) {
  const [exportScope, setExportScope] = useState('all');
  const [exportFormat, setExportFormat] = useState('html');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  const handleExport = () => {
    // Filter real user transactions based on current UI settings
    const filteredRows = realTransactions.filter((row) => {
      // Filter by wallet account
      if (selectedWallet !== 'all' && row.wallet_id?.toString() !== selectedWallet) {
        return false;
      }
      // Filter by date range constraints
      if (startDate && row.date < startDate) {
        return false;
      }
      if (endDate && row.date > endDate) {
        return false;
      }
      return true;
    });

    const rangeMsg = startDate && endDate ? ` ${startDate} s/d ${endDate}` : ' (semua data)';
    toast.success(`Mengekspor ${exportScope}${rangeMsg} format ${exportFormat.toUpperCase()}...`);

    const walletLabel =
      selectedWallet === 'all'
        ? 'All Wallet Accounts'
        : (wallets.find((w) => w.id.toString() === selectedWallet)?.name ?? 'Selected Wallet');

    const suffix = `${exportScope}_${startDate || 'all'}_to_${endDate || 'now'}`;

    if (exportFormat === 'html') {
      const content = buildHtmlReport(exportScope, walletLabel, startDate, endDate, filteredRows);
      downloadBlob(content, `finance_report_${suffix}.html`, 'text/html;charset=utf-8');
    } else if (exportFormat === 'xlsx') {
      const content = buildXlsXml(exportScope, walletLabel, startDate, endDate, filteredRows);
      downloadBlob(content, `finance_report_${suffix}.xls`, 'application/vnd.ms-excel');
    } else {
      const headers = 'Date,Type,Amount,Category,Wallet,Notes\n';
      const csvRows = filteredRows.map(
        (r) => `${r.date},${r.type},${r.amount},${r.category},${r.wallet},${r.notes}`,
      ).join('\n');
      downloadBlob(headers + csvRows, `finance_report_${suffix}.csv`, 'text/csv');
    }
  };

  return (
    <Card className="bg-card/40 border border-border/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconCloudDownload className="h-5 w-5 text-primary" />
          Export Ledger Records
        </CardTitle>
        <CardDescription>Download your transactions, budgets, and statements in spreadsheet formats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scope">Export Scope</Label>
          <Select value={exportScope} onValueChange={setExportScope}>
            <SelectTrigger id="scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Complete Database (All Ledgers)</SelectItem>
              <SelectItem value="transactions">Transactions Only</SelectItem>
              <SelectItem value="debts">Debts &amp; Loans</SelectItem>
              <SelectItem value="goals">Goals Milestones</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wallet-filter">Wallet Scope</Label>
          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
            <SelectTrigger id="wallet-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wallet Accounts</SelectItem>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id.toString()}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DateRangePicker value={dateRange} onChange={setDateRange} />

        <div className="space-y-2">
          <Label htmlFor="format">Output File Format</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="html">
                <span className="flex items-center gap-2">
                  <IconChartBar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  HTML Report + Charts (.html)
                </span>
              </SelectItem>
              <SelectItem value="xlsx">
                <span className="flex items-center gap-2">
                  <IconFileSpreadsheet className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Excel Workbook (.xls)
                </span>
              </SelectItem>
              <SelectItem value="csv">
                <span className="flex items-center gap-2">
                  <IconFileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  Comma-Separated Values (.csv)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {exportFormat === 'html' && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
            <IconChartBar className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span>
              Berisi <strong className="text-foreground">bar chart tren bulanan</strong> dan{' '}
              <strong className="text-foreground">donut chart kategori</strong>. Buka di browser lalu simpan sebagai PDF.
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={handleExport} className="w-full">
          <IconFileSpreadsheet className="h-4 w-4 mr-2" />
          Generate &amp; Download Statement
        </Button>
      </CardFooter>
    </Card>
  );
}
