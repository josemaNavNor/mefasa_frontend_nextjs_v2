"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    VisibilityState,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import Loading from "@/components/loading"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import * as React from "react"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRowClick?: (row: TData) => void
    showFilters?: boolean
    filterColumns?: string[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onRowClick,
    showFilters = false,
    filterColumns = [],
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [showNoData, setShowNoData] = React.useState(false)
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    React.useEffect(() => {
        if (!table.getRowModel().rows?.length) {
            const timer = setTimeout(() => {
                setShowNoData(true)
            }, 7000);
            return () => clearTimeout(timer);
        } else {
            setShowNoData(false)
        }
    }, [table.getRowModel().rows?.length])

    return (
        <div>
            <div className={`flex items-center py-4 gap-4 ${!showFilters ? 'justify-end' : ''}`}>
                {showFilters && (
                    <>
                        <Input
                            placeholder="Buscar por número de ticket..."
                            value={(table.getColumn("ticket_number")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("ticket_number")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                        <Input
                            placeholder="Buscar por título..."
                            value={(table.getColumn("summary")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("summary")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                    </>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={showFilters ? "ml-auto" : ""}>
                            Columnas
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.getAllColumns()
                            .filter(
                                (column) => column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/30">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="border-r border-muted last:border-r-0">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
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
                                    onClick={() => onRowClick?.(row.original)}
                                    className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/20 border-b border-muted/30"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="border-r border-muted/20 last:border-r-0">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {showNoData ? (
                                        <div className="text-muted-foreground">No hay datos disponibles</div>
                                    ) : (
                                        <Loading />
                                    )
                                    }
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between px-4 py-3 border-t border-muted/30 bg-muted/10">
                    <div className="text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} resultado(s)
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Anterior
                        </Button>
                        <div className="text-sm text-muted-foreground px-2">
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}