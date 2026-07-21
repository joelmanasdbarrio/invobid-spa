type BadgeColor = 'yellow' | 'green' | 'red' | 'gray' | 'blue' | 'slate' | 'purple'

const HEX_BY_BADGE_COLOR: Record<BadgeColor, string> = {
  yellow: '#eab308',
  green: '#16a34a',
  red: '#dc2626',
  gray: '#6b7280',
  blue: '#2563eb',
  slate: '#64748b',
  purple: '#9333ea'
}

export function getInvoiceStatusLabel (status: string) {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'verified':
      return 'Verificada'
    case 'correction':
      return 'En corrección'
    case 'denied':
      return 'Denegada'
    default:
      return status
  }
}

export function getAuctionStatusLabel (status: string) {
  switch (status) {
    case 'draft':
      return 'Borrador'
    case 'published':
      return 'Publicada'
    case 'transitioning':
      return 'En transicion'
    case 'finished':
      return 'Finalizada'
    case 'cancelled':
      return 'Cancelada'
    default:
      return status
  }
}

export function getDebtorStatusLabel (status: string) {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'verified':
      return 'Verificado'
    case 'correction':
      return 'En corrección'
    case 'denied':
      return 'Denegado'
    default:
      return status
  }
}

export function getStatusBadgeColor (status: string): BadgeColor {
  switch (status) {
    case 'pending':
      return 'yellow'
    case 'verified':
    case 'published':
      return 'green'
    case 'correction':
    case 'transitioning':
      return 'blue'
    case 'denied':
    case 'cancelled':
      return 'red'
    case 'draft':
      return 'yellow'
    case 'finished':
      return 'purple'
    default:
      return 'slate'
  }
}

export function getStatusHexColor (status: string): string {
  return HEX_BY_BADGE_COLOR[getStatusBadgeColor(status)]
}
