import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDateTime } from '@/lib/format-date'
import type { Bid } from '@/types/Bid'
import type { ColumnDef, Table } from '@tanstack/react-table'
import { useMemo } from 'react'

export function useBidColumns (): ColumnDef<Bid>[] {
  const { locale } = useLocale()

  return useMemo(() => [
    {
      id: 'isWinning',
      header: ''
    },
    {
      accessorKey: 'investor.companyName',
      header: 'Inversor'
    },
    {
      accessorKey: 'amount',
      header: 'Importe',
      cell: ({ row }) => formatCurrency(row.original.amount, locale)
    },
    {
      header: 'Rentabilidad',
      cell: ({ row, table }) => {
        const profitability = Number(row.original.profitability)
        const rows = (table as Table<Bid>).getRowModel().rows
        const prevRow = rows[row.index + 1]
        const delta = prevRow
          ? profitability - Number(prevRow.original.profitability)
          : null
        return (
          <span className='flex flex-col'>
            <span>{profitability.toFixed(2)}%</span>
            {delta !== null && (
              <span className={delta >= 0 ? 'text-green-600 text-xs' : 'text-red-500 text-xs'}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(2)}%
              </span>
            )}
          </span>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => formatDateTime(row.original.createdAt, locale)
    }
  ], [locale])
}
