import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { cn } from '@/lib/utils'
import { InvestorType } from '@/types/User'
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, type VisibilityState } from '@tanstack/react-table'
import { ListFilterIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue> ({
  columns,
  data
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
    <>
      <div className='w-full flex flex-col sm:flex-row md:items-center justify-between gap-2'>
        <h3 className='text-lg'>Resultados de la búsqueda</h3>
        <div className='ms-auto flex gap-2'>
          {loggedInUser?.investorType === InvestorType.COMPANY && (
            <Button onClick={() => navigate('create')}>
              Crear
            </Button>
          )}
          <DialogTrigger asChild className='md:hidden'>
            <Button variant='outline'>
              Filtrar
              <ListFilterIcon />
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <div className='overflow-x-scroll border shadow-sm'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className='bg-accent'>
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
                    <TableCell key={cell.id}>
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
    </>
  )
}
