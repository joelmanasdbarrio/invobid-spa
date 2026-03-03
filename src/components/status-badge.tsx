import React from 'react'

type Icon = React.ReactElement<{ className?: string }>

interface StatusBadgeProps {
  color: 'yellow' | 'green' | 'red' | 'gray' | 'blue' | 'purple';
  icon?: Icon;
  children?: React.ReactNode;
}

const BADGE_STYLES = {
  yellow: {
    spanClass: 'flex items-center gap-2 w-min border border-yellow-300/10 rounded-lg px-2 py-0.5 text-xs text-yellow-600 bg-yellow-300/10 dark:text-yellow-400 dark:bg-yellow-300/20',
    iconClass: 'w-4 h-4 rounded-full text-yellow-600 bg-yellow-300/10 dark:text-yellow-400 dark:bg-yellow-300/20 p-0.5'
  },
  green: {
    spanClass: 'flex items-center gap-2 w-min border border-green-300/10 rounded-lg px-2 py-0.5 text-xs text-green-600 bg-green-300/10 dark:text-green-400 dark:bg-green-300/20',
    iconClass: 'w-4 h-4 rounded-full text-green-600 bg-green-300/10 dark:text-green-400 dark:bg-green-300/20 p-0.5'
  },
  red: {
    spanClass: 'flex items-center gap-2 w-min border border-red-300/10 rounded-lg px-2 py-0.5 text-xs text-red-600 bg-red-300/10 dark:text-red-400 dark:bg-red-300/20',
    iconClass: 'w-4 h-4 rounded-full text-red-600 bg-red-300/10 dark:text-red-400 dark:bg-red-300/20 p-0.5'
  },
  gray: {
    spanClass: 'flex items-center gap-2 w-min border border-zinc-300/10 rounded-lg px-2 py-0.5 text-xs text-zinc-600 bg-zinc-300/10 dark:text-zinc-400 dark:bg-zinc-300/20',
    iconClass: 'w-4 h-4 rounded-full text-zinc-600 bg-zinc-300/10 dark:text-zinc-400 dark:bg-zinc-300/20 p-0.5'
  },
  blue: {
    spanClass: 'flex items-center gap-2 w-min border border-blue-300/10 rounded-lg px-2 py-0.5 text-xs text-blue-600 bg-blue-300/10 dark:text-blue-400 dark:bg-blue-300/20',
    iconClass: 'w-4 h-4 rounded-full text-blue-600 bg-blue-300/10 dark:text-blue-400 dark:bg-blue-300/20 p-0.5'
  },
  purple: {
    spanClass: 'flex items-center gap-2 w-min border border-violet-300/10 rounded-lg px-2 py-0.5 text-xs text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20',
    iconClass: 'w-4 h-4 rounded-full text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20 p-0.5'
  }
} as const

export default function ColorBadge ({ color, icon, children }: StatusBadgeProps) {
  switch (color) {
    case 'yellow':
      return yellowBadge({ icon, children })
    case 'green':
      return greenBadge({ icon, children })
    case 'red':
      return redBadge({ icon, children })
    case 'gray':
      return grayBadge({ icon, children })
    case 'blue':
      return blueBadge({ icon, children })
    case 'purple':
      return purpleBadge({ icon, children })
    default:
      return (
        <span className='flex items-center gap-2 w-min border rounded-lg px-2 py-0.5 text-xs'>
          {children}
        </span>
      )
  }
}

function yellowBadge ({icon, children}: {icon?: Icon, children?: React.ReactNode}) {
  return (
    <span className={BADGE_STYLES.yellow.spanClass}>
      {icon && React.cloneElement(icon, { className: BADGE_STYLES.yellow.iconClass })}
      {children}
    </span>
  )
}

function greenBadge ({icon, children}: {icon?: Icon, children?: React.ReactNode}) {
  return (
    <span className={BADGE_STYLES.green.spanClass}>
      {icon && React.cloneElement(icon, { className: BADGE_STYLES.green.iconClass })}
      {children}
    </span>
  )
}

function redBadge ({icon, children}: {icon?: Icon, children?: React.ReactNode}) {
  return (
    <span className={BADGE_STYLES.red.spanClass}>
      {icon && React.cloneElement(icon, { className: BADGE_STYLES.red.iconClass })}
      {children}
    </span>
  )
}

function grayBadge ({icon, children}: {icon?: Icon, children?: React.ReactNode}) {
  return (
    <span className={BADGE_STYLES.gray.spanClass}>
      {icon && React.cloneElement(icon, { className: BADGE_STYLES.gray.iconClass })}
      {children}
    </span>
  )
}

function blueBadge ({icon, children}: {icon?: Icon, children?: React.ReactNode}) {
  return (
    <span className={BADGE_STYLES.blue.spanClass}>
      {icon && React.cloneElement(icon, { className: BADGE_STYLES.blue.iconClass })}
      {children}
    </span>
  )
}

function purpleBadge ({icon, children}: {icon?: Icon, children?: React.ReactNode}) {
  return (
    <span className={BADGE_STYLES.purple.spanClass}>
      {icon && React.cloneElement(icon, { className: BADGE_STYLES.purple.iconClass })}
      {children}
    </span>
  )
}
