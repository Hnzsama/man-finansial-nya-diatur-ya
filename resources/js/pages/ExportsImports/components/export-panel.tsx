import { useState } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { IconCloudDownload, IconFileSpreadsheet, IconChartBar, IconCalendar, IconX, IconFileText } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
        ? `${format(value.from, 'dd MMM yyyy')} — pick end date`
        : 'Select date range';

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
                  ? `${Math.round((value.to.getTime() - value.from.getTime()) / 86400000) + 1} days selected`
                  : 'Click start date then end date'}
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
            title="Clear date range"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value?.from && value?.to && (
        <p className="text-[11px] text-muted-foreground font-light">
          {format(value.from, 'dd MMMM yyyy')} to {format(value.to, 'dd MMMM yyyy')}
        </p>
      )}
    </div>
  );
}

export function ExportPanel({ wallets, realTransactions }: ExportPanelProps) {
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['transactions', 'debts', 'goals', 'subscriptions']);
  const [exportFormat, setExportFormat] = useState('html');
  const [selectedWallets, setSelectedWallets] = useState<string[]>(['all']);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Advanced PDF Export Options
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeTable, setIncludeTable] = useState(true);

  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  const handleExport = () => {
    if (selectedScopes.length === 0) {
      toast.error('Please select at least one export scope!');
      return;
    }

    // Filter real user transactions based on current UI settings
    const filteredRows = realTransactions.filter((row) => {
      // Exclude Transfer Fund transactions entirely from exports
      if (row.category === 'Transfer Fund') {
        return false;
      }

      // 1. Filter by scope (multi-select)
      let matchesScope = false;
      if (selectedScopes.includes('transactions') && !row.goal_id && !row.debt_id && !row.is_subscription) {
        matchesScope = true;
      }
      if (selectedScopes.includes('debts') && row.debt_id) {
        matchesScope = true;
      }
      if (selectedScopes.includes('goals') && row.goal_id) {
        matchesScope = true;
      }
      if (selectedScopes.includes('subscriptions') && row.is_subscription) {
        matchesScope = true;
      }
      if (!matchesScope) {
        return false;
      }

      // 2. Filter by wallet account (multi-select)
      if (selectedWallets.length > 0 && !selectedWallets.includes('all')) {
        if (!row.wallet_id || !selectedWallets.includes(row.wallet_id.toString())) {
          return false;
        }
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

    const rangeMsg = startDate && endDate ? ` ${startDate} to ${endDate}` : ' (all data)';
    const scopeLabel = selectedScopes.length === 4 ? 'All Ledgers' : selectedScopes.join(', ');
    toast.success(`Exporting ${scopeLabel}${rangeMsg} in ${exportFormat.toUpperCase()} format...`);

    const walletLabel =
      selectedWallets.includes('all') || selectedWallets.length === 0
        ? 'All Wallet Accounts'
        : wallets
            .filter((w) => selectedWallets.includes(w.id.toString()))
            .map((w) => w.name)
            .join(', ');

    const dateStr = startDate && endDate
      ? `${startDate}_sd_${endDate}`
      : `sd_${format(new Date(), 'yyyy-MM-dd')}`;

    const timeSuffix = format(new Date(), 'HHmmss');
    const filenameBase = `finance_report_${selectedScopes.join('_')}_${dateStr}_${timeSuffix}`;

    if (exportFormat === 'html') {
      const content = buildHtmlReport(scopeLabel, walletLabel, startDate, endDate, filteredRows, { orientation, includeCharts, includeStats, includeTable });
      downloadBlob(content, `${filenameBase}.html`, 'text/html;charset=utf-8');
    } else if (exportFormat === 'pdf') {
      const content = buildHtmlReport(scopeLabel, walletLabel, startDate, endDate, filteredRows, { orientation, includeCharts, includeStats, includeTable });
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }
    } else if (exportFormat === 'xlsx') {
      const content = buildXlsXml(scopeLabel, walletLabel, startDate, endDate, filteredRows);
      downloadBlob(content, `${filenameBase}.xls`, 'application/vnd.ms-excel');
    } else {
      const headers = '# Note: Transfer Fund (internal wallet transfers) are excluded from this export.\nDate,Type,Amount,Category,Wallet,Notes\n';
      const csvRows = filteredRows.map(
        (r) => `${r.date},${r.type},${r.amount},${r.category},${r.wallet},${r.notes}`,
      ).join('\n');
      downloadBlob(headers + csvRows, `${filenameBase}.csv`, 'text/csv');
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
          <Label>Export Scope (Multi-Select)</Label>
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border/50 bg-background/30">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium cursor-pointer select-none">
              <Checkbox
                checked={selectedScopes.includes('transactions')}
                onCheckedChange={(checked) => {
                  setSelectedScopes((prev) =>
                    checked ? [...prev, 'transactions'] : prev.filter((s) => s !== 'transactions')
                  );
                }}
              />
              Transactions Only
            </label>
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium cursor-pointer select-none">
              <Checkbox
                checked={selectedScopes.includes('debts')}
                onCheckedChange={(checked) => {
                  setSelectedScopes((prev) =>
                    checked ? [...prev, 'debts'] : prev.filter((s) => s !== 'debts')
                  );
                }}
              />
              Debts &amp; Loans
            </label>
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium cursor-pointer select-none">
              <Checkbox
                checked={selectedScopes.includes('goals')}
                onCheckedChange={(checked) => {
                  setSelectedScopes((prev) =>
                    checked ? [...prev, 'goals'] : prev.filter((s) => s !== 'goals')
                  );
                }}
              />
              Goals Milestones
            </label>
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium cursor-pointer select-none">
              <Checkbox
                checked={selectedScopes.includes('subscriptions')}
                onCheckedChange={(checked) => {
                  setSelectedScopes((prev) =>
                    checked ? [...prev, 'subscriptions'] : prev.filter((s) => s !== 'subscriptions')
                  );
                }}
              />
              Subscriptions
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Wallet Scope (Multi-Select)</Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border/50 bg-background/30 max-h-40 overflow-y-auto">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium cursor-pointer select-none bg-accent/40 px-3 py-1.5 rounded-md">
              <Checkbox
                checked={selectedWallets.includes('all') || selectedWallets.length === 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedWallets(['all']);
                  } else {
                    setSelectedWallets([]);
                  }
                }}
              />
              All Wallets
            </label>
            {wallets.map((w) => (
              <label key={w.id} className="flex items-center gap-2 text-xs md:text-sm font-medium cursor-pointer select-none bg-accent/40 px-3 py-1.5 rounded-md">
                <Checkbox
                  checked={selectedWallets.includes(w.id.toString()) && !selectedWallets.includes('all')}
                  onCheckedChange={(checked) => {
                    setSelectedWallets((prev) => {
                      const withoutAll = prev.filter((id) => id !== 'all');
                      if (checked) {
                        return [...withoutAll, w.id.toString()];
                      } else {
                        return withoutAll.filter((id) => id !== w.id.toString());
                      }
                    });
                  }}
                />
                {w.name}
              </label>
            ))}
          </div>
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
              <SelectItem value="pdf">
                <span className="flex items-center gap-2">
                  <IconFileText className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                  PDF Document (.pdf)
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

        {(exportFormat === 'pdf' || exportFormat === 'html') && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Advanced PDF Options</h4>
            <div className="space-y-2">
              <Label htmlFor="pdf-orientation">Page Orientation</Label>
              <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
                <SelectTrigger id="pdf-orientation" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={includeStats} onCheckedChange={(v) => setIncludeStats(!!v)} id="chk-stats" />
                <span>Summary</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={includeCharts} onCheckedChange={(v) => setIncludeCharts(!!v)} id="chk-charts" />
                <span>Charts</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={includeTable} onCheckedChange={(v) => setIncludeTable(!!v)} id="chk-table" />
                <span>Table</span>
              </label>
            </div>
          </div>
        )}

        {exportFormat === 'html' && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
            <IconChartBar className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span>
              Contains a <strong className="text-foreground">monthly trend bar chart</strong> and a{' '}
              <strong className="text-foreground">category donut chart</strong>. Open in your browser and print to save as a PDF.
            </span>
          </div>
        )}

        {exportFormat === 'pdf' && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
            <IconFileText className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>
              Interactive report with charts optimized for PDF printing. Select the <strong className="text-foreground">Save as PDF</strong> option in your browser's print dialog.
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
