import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCoreRowModel, useReactTable, type ColumnDef, type VisibilityState } from '@tanstack/react-table'
import { useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  totalItems: number
}

export function DataTable<TData, TValue> ({
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
    <div className='*:data-[slot=table-container]:max-h-64 *:data-[slot=table-container]:overflow-auto border-y'>
      <Table className='table-padding'>
        <TableHeader className='bg-accent sticky top-0 z-10'>
          <TableRow>
            <TableHead>Inversor</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Corporación DEF</TableCell>
            <TableCell>€ 2.000,00</TableCell>
            <TableCell>2024-01-05 09:15:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Grupo Financiero QRS</TableCell>
            <TableCell>€ 1.800,00</TableCell>
            <TableCell>2024-01-04 14:20:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Inversiones ABC</TableCell>
            <TableCell>€ 1.500,00</TableCell>
            <TableCell>2024-01-03 10:45:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Compañía XYZ</TableCell>
            <TableCell>€ 1.200,00</TableCell>
            <TableCell>2024-01-02 15:30:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Empresa S.A.</TableCell>
            <TableCell>€ 1.000,00</TableCell>
            <TableCell>2024-01-01 12:00:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Finanzas Globales</TableCell>
            <TableCell>€ 900,00</TableCell>
            <TableCell>2023-12-30 11:00:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Inversiones LMN</TableCell>
            <TableCell>€ 800,00</TableCell>
            <TableCell>2023-12-29 16:45:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Corporación DEF</TableCell>
            <TableCell>€ 700,00</TableCell>
            <TableCell>2023-12-28 09:30:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Grupo Financiero QRS</TableCell>
            <TableCell>€ 600,00</TableCell>
            <TableCell>2023-12-27 14:15:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Inversiones ABC</TableCell>
            <TableCell>€ 500,00</TableCell>
            <TableCell>2023-12-26 10:00:00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
