import { Card, CardContent } from '@/components/ui/card'
import type { Invoice } from '@/types/Invoice'
import { flexRender, type Row } from '@tanstack/react-table'
import { Fragment } from 'react'
import { Link } from 'react-router'

export default function InvoiceCard ({ row }: { row: Row<Invoice> }) {
  return (
    <Link to={`/marketplace/invoices/${row.original.id}`} className='block w-full h-full relative rounded-xl overflow-hidden'>
      <Card className='hover:bg-accent h-full py-0 border-2'>
        <CardContent className='flex flex-col gap-4 justify-between h-full overflow-x-auto py-4'>
          {row.getVisibleCells().map(cell => (
            <Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Fragment>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
