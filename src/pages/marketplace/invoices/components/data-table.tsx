import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import type { Invoice } from '@/types/Invoice'
import { type ColumnDef, getCoreRowModel, useReactTable, type VisibilityState } from '@tanstack/react-table'
import { ListFilterIcon } from 'lucide-react'
import { useState } from 'react'
import InvoiceCard from './invoice-card'

interface DataTableProps<TData extends Invoice, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalItems: number
}

export function DataTable<TData extends Invoice, TValue> ({
  columns,
  data,
  totalItems
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
    <>
      <div className='w-full flex flex-col sm:flex-row md:items-center justify-between gap-2 px-2 py-6'>
        <div className='flex gap-2 items-center justify-between sm:justify-start md:justify-between w-full'>
          <h3>Resultados de la búsqueda</h3>
          <span className='text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-lg'>{totalItems} resultado{totalItems !== 1 && 's'}</span>
        </div>
        <DialogTrigger asChild className='md:hidden ms-auto'>
          <Button variant='outline'>
            Filtrar
            <ListFilterIcon />
          </Button>
        </DialogTrigger>
      </div>
      <div className='w-full flex justify-center'>
        {table.getRowModel().rows?.length ? (
          <div className='grid 2xl:grid-cols-2 gap-4'>
            {table.getRowModel().rows.map(row => (
              <InvoiceCard key={row.id} row={row} />
            ))}
          </div>
        ) : (
          <span>No hay resultados.</span>
        )}
      </div>
    </>
  )
}
