import React from 'react';
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconLayoutColumns,
} from "@tabler/icons-react";
import { router } from '@inertiajs/react';
import { toast } from "sonner";
import { ConfirmDialog } from '@/components/confirm-dialog';
import * as LucideIcons from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Wallet {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'digital';
  color: string | null;
  current_balance: number | string;
  notes: string | null;
}

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string | null;
  icon: string | null;
}

interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number | null;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number | string;
  date: string;
  notes: string | null;
  wallet: Wallet;
  category: Category | null;
}

const DynamicIcon = ({ name, className }: { name?: string | null; className?: string }) => {
  if (!name) {
    return <LucideIcons.Folder className={className} />;
  }
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    return <LucideIcons.Folder className={className} />;
  }
  return <IconComponent className={className} />;
};

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const hasDecimals = numericValue % 1 !== 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

function TableCellViewer({ item }: { item: Transaction }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground h-auto text-sm justify-start font-normal hover:no-underline">
          {item.notes ? (
            <span className="max-w-[80px] sm:max-w-[150px] md:max-w-[200px] truncate block text-left">{item.notes}</span>
          ) : (
            <span className="italic text-muted-foreground text-xs">No notes</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Transaction Details</DrawerTitle>
          <DrawerDescription>Detailed information about your transaction</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium text-lg">
                  Amount: <span className={item.type === 'income' ? 'text-green-600 dark:text-green-400' : item.type === 'expense' ? 'text-destructive' : ''}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  Date: {new Date(item.date).toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-3">
              <Label htmlFor="notes">Notes / Description</Label>
              <Input id="notes" value={item.notes || ''} readOnly className="bg-muted/50 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                <Input id="type" value={item.type === 'income' ? 'Income' : item.type === 'expense' ? 'Expense' : item.type === 'transfer' ? 'Transfer' : 'Adjustment'} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" value={formatCurrency(item.amount)} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="wallet">Wallet / Account</Label>
                <Input id="wallet" value={item.wallet.name} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={item.category?.name || '-'} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const getColumns = (onDelete: (id: number) => void): ColumnDef<Transaction>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      return date.toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    }
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original.category;
      if (!cat) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="p-2 rounded-lg bg-primary/10" style={{ color: cat.color || 'inherit' }}>
            <DynamicIcon name={cat.icon} className="w-4 h-4" />
          </div>
          {cat.name}
        </div>
      );
    },
  },
  {
    accessorKey: "wallet",
    header: "Wallet",
    cell: ({ row }) => {
      const w = row.original.wallet;
      return <div className="font-medium">{w?.name || '-'}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const labels: Record<string, string> = {
        income: "Income",
        expense: "Expense",
        transfer: "Transfer",
        adjustment: "Adjustment"
      };
      return (
        <Badge variant="outline" className="px-1.5">
          {labels[type] || type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="w-full text-right">Amount</div>,
    cell: ({ row }) => {
      const type = row.original.type;
      const isIncome = type === 'income';
      const isExpense = type === 'expense';
      return (
        <div className={`text-right font-medium tabular-nums ${isIncome ? 'text-green-600 dark:text-green-400' : isExpense ? 'text-destructive' : ''}`}>
          {isIncome ? '+' : isExpense ? '-' : ''} {formatCurrency(row.original.amount)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transactionId = row.original.id;
      const handleDelete = () => {
        onDelete(transactionId);
      };
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => router.get('/transactions', { search: row.original.notes || '' })}>
              Edit in Transactions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function RecentTransactions({ data, wallets }: { data: Transaction[], wallets: Wallet[] }) {
  const [activeTab, setActiveTab] = React.useState("outline");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const [deletingTransactionId, setDeletingTransactionId] = React.useState<number | null>(null);

  const columns = React.useMemo(() => getColumns((id) => setDeletingTransactionId(id)), []);

  const confirmDelete = () => {
    if (!deletingTransactionId) return;
    router.delete(`/transactions/${deletingTransactionId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setDeletingTransactionId(null);
        toast.success("Transaction successfully deleted");
      }
    });
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-col justify-start gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">View</Label>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
            <SelectValue placeholder="Select View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Recent Transactions</SelectItem>
            <SelectItem value="key-personnel">Wallets List</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Recent Transactions</TabsTrigger>
          <TabsTrigger value="key-personnel">Wallets List</TabsTrigger>
        </TabsList>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "outline" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table.getAllColumns().filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide()).map((c) => (
                  <DropdownMenuCheckboxItem key={c.id} className="capitalize" checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)}>
                    {c.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm" onClick={() => router.get('/transactions')}>
            Manage Transactions
          </Button>
        </div>
      </div>
      <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} colSpan={h.colSpan}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">No transactions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Show per page</Label>
              <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(v) => table.setPageSize(Number(v))}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((ps) => (
                    <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Previous page</span><IconChevronLeft />
              </Button>
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <span className="sr-only">Next page</span><IconChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Card key={wallet.id} className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow bg-card">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: wallet.color || '#3b82f6' }} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">{wallet.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 capitalize">{wallet.type}</CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10" style={{ color: wallet.color || 'inherit' }}>
                    <LucideIcons.Wallet className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold tabular-nums text-green-600 dark:text-green-400">
                    {formatCurrency(wallet.current_balance)}
                  </div>
                  {wallet.notes && (
                    <p className="text-xs text-muted-foreground mt-2 truncate" title={wallet.notes}>
                      {wallet.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full w-full rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              No wallets registered.
            </div>
          )}
        </div>
      </TabsContent>

      <ConfirmDialog
        open={!!deletingTransactionId}
        onOpenChange={(open) => !open && setDeletingTransactionId(null)}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </Tabs>
  );
}
