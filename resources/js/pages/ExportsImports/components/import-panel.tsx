import { IconCloudUpload } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as importStore } from '@/actions/App/Http/Controllers/ExportImportController';

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

export function ImportPanel() {
  const importForm = useForm({ csv_file: null as File | null });

  const handleDownloadTemplate = () => {
    toast.success('Mengunduh template impor CSV...');
    const lines = [
      '# FINANCE IMPORT TEMPLATE',
      '# ========================',
      '# PETUNJUK:',
      "# 1. Hapus baris komentar (#) sebelum import",
      "# 2. Date: format YYYY-MM-DD",
      "# 3. Type: 'income' atau 'expense'",
      "# 4. Amount: angka tanpa pemisah ribuan",
      "# 5. Category & Wallet: sesuai data di aplikasi",
      '# ========================',
      'Date,Type,Amount,Category,Wallet,Notes',
      '2026-07-01,income,12000000,Salary,Savings Wallet,Gaji Juli 2026',
      '2026-07-05,expense,50000,Food & Dining,Cash,Makan siang',
      '2026-07-10,expense,200000,Transportation,Cash,Bensin motor',
      '2026-07-15,income,500000,Freelance,BCA Wallet,Honorarium desain',
      '2026-07-20,expense,350000,Shopping,BCA Wallet,Belanja kebutuhan',
    ].join('\n');
    downloadBlob(lines, 'finance_import_template.csv', 'text/csv;charset=utf-8;');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.data.csv_file) {
      toast.error('Pilih file CSV terlebih dahulu.');
      return;
    }
    importForm.post(importStore.url(), {
      preserveScroll: true,
      onSuccess: () => { toast.success('CSV berhasil diimpor.'); importForm.reset(); },
    });
  };

  return (
    <Card className="bg-card/40 border border-border/50 shadow-sm backdrop-blur-sm">
      <form onSubmit={handleImportSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconCloudUpload className="h-5 w-5 text-green-600 dark:text-green-400" />
            Import Bank Mutations CSV
          </CardTitle>
          <CardDescription>
            Upload banking export sheets to automatically batch import transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-uploader">Select CSV Statement File</Label>
            <div className="border border-dashed border-border/60 hover:border-primary/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-muted/10 cursor-pointer relative">
              <Input
                id="file-uploader"
                type="file"
                accept=".csv,text/csv"
                onChange={e => importForm.setData('csv_file', e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <IconCloudUpload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground/90">
                {importForm.data.csv_file ? importForm.data.csv_file.name : 'Click to select or drop CSV file'}
              </span>
              <span className="text-[10px] text-muted-foreground font-light">
                Maksimal 2MB (text/csv only)
              </span>
            </div>
            {importForm.errors.csv_file && (
              <p className="text-xs text-destructive mt-1">{importForm.errors.csv_file}</p>
            )}
          </div>

          <div className="flex justify-between items-center bg-muted/20 p-2.5 rounded-lg border border-border/40 text-xs">
            <span className="text-muted-foreground">Butuh template format?</span>
            <Button type="button" variant="link" onClick={handleDownloadTemplate} className="h-auto p-0 font-bold">
              Download CSV Template
            </Button>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button type="submit" className="w-full" disabled={importForm.processing || !importForm.data.csv_file}>
            {importForm.processing ? 'Importing...' : 'Upload & Parse Statement'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
