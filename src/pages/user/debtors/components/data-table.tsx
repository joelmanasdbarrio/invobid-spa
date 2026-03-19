import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { cn } from '@/lib/utils'
import { InvestorType, type Investor } from '@/types/User'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type VisibilityState } from '@tanstack/react-table'
import { ListFilterIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalItems: number
}

export function DataTable<TData, TValue> ({
  columns,
  data,
  totalItems
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const navigate = useNavigate()

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

  const loggedInUser = useLoggedInUser()

  return (
    <div className='rounded-xl border shadow-sm'>
      <div className='w-full flex flex-col sm:flex-row md:items-center justify-between gap-2 p-6'>
        <div className='flex gap-2 items-center justify-between sm:justify-start md:justify-between w-full'>
          <h3>Resultados de la búsqueda</h3>
          <span className='text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-lg'>{totalItems} resultado{totalItems !== 1 && 's'}</span>
        </div>
        {(loggedInUser as Investor)?.investorType === InvestorType.COMPANY && (
          <Button onClick={() => navigate('create')}>
            Crear
          </Button>
        )}
        <DialogTrigger asChild className='md:hidden ms-auto'>
          <Button variant='outline'>
            Filtrar
            <ListFilterIcon />
          </Button>
        </DialogTrigger>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className='bg-accent first:ps-6 last:pe-6'>
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
                data-state={row.getIsSelected() && 'selected'}
                className={
                  cn({
                    'bg-red-600/10': row.original.deletedAt != null
                  })
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='first:ps-6 last:pe-6'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
