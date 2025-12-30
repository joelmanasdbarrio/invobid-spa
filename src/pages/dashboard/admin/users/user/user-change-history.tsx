import {Card, CardContent} from '@/components/ui/card.tsx'

export function UserChangeHistory () {
  return (
    <Card>
      <CardContent>
        <ul className='list-disc list-inside list-linked space-y-2' />
      </CardContent>
    </Card>
  )
}
