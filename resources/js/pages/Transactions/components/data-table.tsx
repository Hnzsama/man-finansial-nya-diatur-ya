import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight
} from '@tabler/icons-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pagination,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50 shadow-sm">
            <div className="overflow-x-auto w-full">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/50 border-border/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    No transactions found. Try adjusting your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-border/40 bg-card/30">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                        Showing <span className="font-medium text-foreground">{data.length}</span> of{' '}
                        <span className="font-medium text-foreground">{pagination.total}</span> records.
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                            Page <span className="text-foreground font-semibold">{pagination.current_page}</span> of <span className="text-foreground font-semibold">{pagination.last_page}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                size="icon"
                                onClick={() => router.get(pagination.first_page_url, {}, { preserveScroll: true, preserveState: true })}
                                disabled={pagination.current_page === 1}
                            >
                                <span className="sr-only">Go to first page</span>
                                <IconChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                size="icon"
                                onClick={() => pagination.prev_page_url && router.get(pagination.prev_page_url, {}, { preserveScroll: true, preserveState: true })}
                                disabled={!pagination.prev_page_url}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <IconChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                size="icon"
                                onClick={() => pagination.next_page_url && router.get(pagination.next_page_url, {}, { preserveScroll: true, preserveState: true })}
                                disabled={!pagination.next_page_url}
                            >
                                <span className="sr-only">Go to next page</span>
                                <IconChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                size="icon"
                                onClick={() => router.get(pagination.last_page_url, {}, { preserveScroll: true, preserveState: true })}
                                disabled={pagination.current_page === pagination.last_page}
                            >
                                <span className="sr-only">Go to last page</span>
                                <IconChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
