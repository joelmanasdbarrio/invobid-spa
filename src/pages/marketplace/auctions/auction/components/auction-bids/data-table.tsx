import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type VisibilityState } from '@tanstack/react-table'
import { CrownIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalItems: number
  onLoadMore?: () => void
}

export function DataTable<TData, TValue> ({
  columns,
  data,
  totalItems,
  onLoadMore
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLTableRowElement>(null)
  const hasMore = data.length < totalItems

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || !onLoadMore) return

    const scrollParent = containerRef.current?.querySelector('[data-slot="table-container"]') as Element | null

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { root: scrollParent, threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility
    }
  })

  return (
    <div ref={containerRef} className='*:data-[slot=table-container]:max-h-72 *:data-[slot=table-container]:w-full *:data-[slot=table-container]:overflow-scroll border-y'>
      <Table className='table-padding'>
        <TableHeader className='bg-accent sticky top-0 z-10'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            <>
              {table.getRowModel().rows.map((row, i) => (
                <TableRow key={row.id} className='first-of-type:bg-yellow-500/15 min-h-24'>
                  {row.getVisibleCells().map((cell, j) => (
                    <TableCell key={cell.id}>
                      {(i === 0 && j === 0) && <CrownIcon className='size-4 text-yellow-600' />}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {hasMore && (
                <TableRow ref={sentinelRef}>
                  <TableCell colSpan={columns.length} className='p-2 text-center'>
                    Cargando más pujas...
                  </TableCell>
                </TableRow>
              )}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No hay pujas aún.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
