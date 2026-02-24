import { CheckCheckIcon, CircleAlertIcon, ClockIcon, OctagonXIcon } from 'lucide-react'

interface StatusBadgeProps {
  status: 'pending' | 'verified' | 'correction' | 'denied';
  children?: React.ReactNode;
}

export default function StatusBadge ({ status, children }: StatusBadgeProps) {
  switch (status) {
    case 'pending':
      return pendingBadge({ children })
    case 'verified':
      return verifiedBadge({ children })
    case 'correction':
      return correctionBadge({ children })
    case 'denied':
      return deniedBadge({ children })
    default:
      return null
  }
}

function pendingBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-yellow-300/10 rounded-lg px-2 py-0.5 text-xs text-yellow-600 bg-yellow-300/10'>
      <ClockIcon className='w-4 h-4 rounded-full text-yellow-600 bg-yellow-300/10 p-0.5'/>
      {children || 'Pendiente'}
    </span>
  )
}

function verifiedBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-green-300/10 rounded-lg px-2 py-0.5 text-xs text-green-600 bg-green-300/10'>
      <CheckCheckIcon className='w-4 h-4 rounded-full text-green-600 bg-green-300/10 p-0.5'/>
      {children || 'Verificado'}
    </span>
  )
}

function correctionBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-red-300/10 rounded-lg px-2 py-0.5 text-xs text-red-600 bg-red-300/10'>
      <CircleAlertIcon className='w-4 h-4 rounded-full text-red-600 bg-red-300/10 p-0.5'/>
      {children || 'Corrección'}
    </span>
  )
}

function deniedBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-zinc-300/10 rounded-lg px-2 py-0.5 text-xs text-zinc-600 bg-zinc-300/10'>
      <OctagonXIcon className='w-4 h-4 rounded-full text-zinc-600 bg-zinc-300/10 p-0.5'/>
      {children || 'Denegado'}
    </span>
  )
}
