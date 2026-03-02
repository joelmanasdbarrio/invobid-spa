import { CheckCheckIcon, CircleAlertIcon, ClockIcon, OctagonXIcon } from 'lucide-react'

interface StatusBadgeProps {
  color: 'yellow' | 'green' | 'red' | 'gray' | 'blue' | 'purple';
  children?: React.ReactNode;
}

export default function StatusBadge ({ color, children }: StatusBadgeProps) {
  switch (color) {
    case 'yellow':
      return yellowBadge({ children })
    case 'green':
      return greenBadge({ children })
    case 'red':
      return redBadge({ children })
    case 'gray':
      return grayBadge({ children })
    case 'blue':
      return blueBadge({ children })
    case 'purple':
      return purpleBadge({ children })
    default:
      return (
        <span className='flex items-center gap-2 w-min border rounded-lg px-2 py-0.5 text-xs'>
          {children}
        </span>
      )
  }
}

function yellowBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-yellow-300/10 rounded-lg px-2 py-0.5 text-xs text-yellow-600 bg-yellow-300/10 dark:text-yellow-400 dark:bg-yellow-300/20'>
      <ClockIcon className='w-4 h-4 rounded-full text-yellow-600 bg-yellow-300/10 dark:text-yellow-400 dark:bg-yellow-300/20 p-0.5'/>
      {children || 'Pendiente'}
    </span>
  )
}

function greenBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-green-300/10 rounded-lg px-2 py-0.5 text-xs text-green-600 bg-green-300/10 dark:text-green-400 dark:bg-green-300/20'>
      <CheckCheckIcon className='w-4 h-4 rounded-full text-green-600 bg-green-300/10 dark:text-green-400 dark:bg-green-300/20 p-0.5'/>
      {children || 'Verificado'}
    </span>
  )
}

function redBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-red-300/10 rounded-lg px-2 py-0.5 text-xs text-red-600 bg-red-300/10 dark:text-red-400 dark:bg-red-300/20'>
      <CircleAlertIcon className='w-4 h-4 rounded-full text-red-600 bg-red-300/10 dark:text-red-400 dark:bg-red-300/20 p-0.5'/>
      {children || 'Corrección'}
    </span>
  )
}

function grayBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-zinc-300/10 rounded-lg px-2 py-0.5 text-xs text-zinc-600 bg-zinc-300/10 dark:text-zinc-400 dark:bg-zinc-300/20'>
      <OctagonXIcon className='w-4 h-4 rounded-full text-zinc-600 bg-zinc-300/10 dark:text-zinc-400 dark:bg-zinc-300/20 p-0.5'/>
      {children || 'Denegado'}
    </span>
  )
}

function blueBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-blue-300/10 rounded-lg px-2 py-0.5 text-xs text-blue-600 bg-blue-300/10 dark:text-blue-400 dark:bg-blue-300/20'>
      <ClockIcon className='w-4 h-4 rounded-full text-blue-600 bg-blue-300/10 dark:text-blue-400 dark:bg-blue-300/20 p-0.5'/>
      {children || 'Pausado'}
    </span>
  )
}

function purpleBadge ({children}: {children?: React.ReactNode}) {
  return (
    <span className='flex items-center gap-2 w-min border border-violet-300/10 rounded-lg px-2 py-0.5 text-xs text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20'>
      <CheckCheckIcon className='w-4 h-4 rounded-full text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20 p-0.5'/>
      {children || 'Finalizado'}
    </span>
  )
}
