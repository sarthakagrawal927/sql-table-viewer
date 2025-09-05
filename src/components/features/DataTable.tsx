import { useMemo, useState, memo, useCallback, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Download, Search, ArrowUpDown, ArrowUp, ArrowDown, FileText, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import type { QueryResult, Row } from '../../types'
import { formatRowCount, downloadAsFile } from '../../lib/utils'
import Papa from 'papaparse'

interface DataTableProps {
  result: QueryResult | null
  isLoading?: boolean
}

export const DataTable = memo(function DataTable({ result, isLoading }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const parentRef = useRef<HTMLDivElement>(null)

  const columns = useMemo<ColumnDef<Row>[]>(() => {
    if (!result) return []

    const getColumnSize = (key: string): { size: number; minSize: number; maxSize: number } => {
      const sizeMap: Record<string, { size: number; minSize: number; maxSize: number }> = {
        email: { size: 250, minSize: 250, maxSize: 300 },
        name: { size: 180, minSize: 180, maxSize: 220 },
        description: { size: 300, minSize: 200, maxSize: 400 },
        default: { size: 150, minSize: 120, maxSize: 200 },
      }
      return sizeMap[key] || sizeMap.default
    }

    return result.columns.map(col => {
      const columnSizes = getColumnSize(col.key)
      return {
        id: col.key,
        accessorKey: col.key,
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 lg:px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span className="font-medium">{col.label}</span>
            {column.getIsSorted() === 'asc' && <ArrowUp className="ml-1 h-3 w-3" />}
            {column.getIsSorted() === 'desc' && <ArrowDown className="ml-1 h-3 w-3" />}
            {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue()
          if (value === null || value === undefined) {
            return <span className="text-muted-foreground italic">null</span>
          }
          if (typeof value === 'boolean') {
            return <Badge variant={value ? 'default' : 'secondary'}>{String(value)}</Badge>
          }
          if (typeof value === 'number') {
            return <span className="font-mono">{value.toLocaleString()}</span>
          }
          if (col.type === 'date' && typeof value === 'string') {
            return <span className="font-mono">{new Date(value).toLocaleDateString()}</span>
          }
          return (
            <span className="truncate block" title={String(value)}>
              {String(value)}
            </span>
          )
        },
        ...columnSizes,
      }
    })
  }, [result])

  const tableData = useMemo(() => result?.rows || [], [result?.rows])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: false,
    enableMultiRowSelection: false,
    enableSubRowSelection: false,
    manualSorting: false,
    manualFiltering: false,
    manualPagination: false,
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  })

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 3,
    measureElement: undefined,
  })

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      if (!result) return

      const data = table.getFilteredRowModel().rows.map(row => row.original)

      if (format === 'csv') {
        const csv = Papa.unparse(data)
        downloadAsFile(csv, `query-result-${Date.now()}.csv`, 'text/csv')
      } else {
        const json = JSON.stringify(data, null, 2)
        downloadAsFile(json, `query-result-${Date.now()}.json`, 'application/json')
      }
    },
    [result, table]
  )

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-2">
            <Database className="h-8 w-8 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Executing query...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
            <FileText className="h-8 w-8" />
            <p className="text-sm">No query results</p>
            <p className="text-xs">Execute a query to see results here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-lg">Query Results</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">{formatRowCount(result.rowCount)} rows</Badge>
              <Badge variant="outline">{result.columns.length} columns</Badge>
              <span>{result.executionTime.toFixed(0)}ms</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search all columns..."
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                className="h-9 w-64 rounded-md border border-input bg-background px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="border rounded-md mx-4 mb-4">
          <div
            ref={parentRef}
            className="h-[400px] overflow-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
            }}
          >
            <table
              style={{
                tableLayout: 'fixed',
                width: '100%',
                minWidth: 'max-content',
              }}
            >
              {/* Fixed header */}
              <thead className="sticky top-0 z-10 bg-background border-b">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="h-10 px-2 text-left align-middle font-medium text-muted-foreground border-r last:border-r-0 bg-muted/50"
                        style={{
                          width: `${header.getSize()}px`,
                          minWidth: `${header.getSize()}px`,
                          maxWidth: `${header.getSize()}px`,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              {/* Virtual rows container */}
              <tbody style={{ position: 'relative', height: `${virtualizer.getTotalSize()}px` }}>
                {virtualizer.getVirtualItems().map(virtualRow => {
                  const row = rows[virtualRow.index]
                  return (
                    <tr
                      key={row.id}
                      className="absolute w-full border-b hover:bg-muted/50 transition-colors"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        top: 0,
                        left: 0,
                        display: 'table',
                        tableLayout: 'fixed',
                        width: '100%',
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-2 align-middle border-r last:border-r-0"
                          style={{
                            width: `${cell.column.getSize()}px`,
                            minWidth: `${cell.column.getSize()}px`,
                            maxWidth: `${cell.column.getSize()}px`,
                            display: 'table-cell',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-4 text-sm text-muted-foreground">
          <div>
            Showing {table.getFilteredRowModel().rows.length} of {result.rowCount} rows
          </div>
          <div>Query executed in {result.executionTime.toFixed(2)}ms</div>
        </div>
      </CardContent>
    </Card>
  )
})
