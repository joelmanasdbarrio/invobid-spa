import { cn } from '@/lib/utils'
import React from 'react'

type Icon = React.ReactElement<{ className?: string }>

interface ColorBadgeProps {
  color: 'yellow' | 'green' | 'red' | 'gray' | 'blue' | 'slate' | 'purple';
  icon?: Icon;
  children?: React.ReactNode;
  className?: string;
}

const BADGE_STYLES = {
  yellow: {
    spanClass: 'border-yellow-300/10 text-yellow-600 bg-yellow-300/10 dark:text-yellow-400 dark:bg-yellow-300/20',
    iconClass: 'text-yellow-600 bg-yellow-300/10 dark:text-yellow-400 dark:bg-yellow-300/20'
  },
  green: {
    spanClass: 'border-green-300/10 text-green-600 bg-green-300/10 dark:text-green-400 dark:bg-green-300/20',
    iconClass: 'text-green-600 bg-green-300/10 dark:text-green-400 dark:bg-green-300/20'
  },
  red: {
    spanClass: 'border-red-300/10 text-red-600 bg-red-300/10 dark:text-red-400 dark:bg-red-300/20',
    iconClass: 'text-red-600 bg-red-300/10 dark:text-red-400 dark:bg-red-300/20'
  },
  gray: {
    spanClass: 'border-zinc-300/10 text-zinc-600 bg-zinc-300/10 dark:text-zinc-400 dark:bg-zinc-300/20',
    iconClass: 'text-zinc-600 bg-zinc-300/10 dark:text-zinc-400 dark:bg-zinc-300/20'
  },
  blue: {
    spanClass: 'border-blue-300/10 text-blue-600 bg-blue-300/10 dark:text-blue-400 dark:bg-blue-300/20',
    iconClass: 'text-blue-600 bg-blue-300/10 dark:text-blue-400 dark:bg-blue-300/20'
  },
  slate: {
    spanClass: 'border-slate-300/10 text-slate-600 bg-slate-300/10 dark:text-slate-400 dark:bg-slate-300/20',
    iconClass: 'text-slate-600 bg-slate-300/10 dark:text-slate-400 dark:bg-slate-300/20'
  },
  purple: {
    spanClass: 'border-violet-300/10 text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20',
    iconClass: 'text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20'
  }
} as const

export function ColorBadge ({ color, icon, children, className }: ColorBadgeProps) {
  switch (color) {
    case 'yellow':
      return yellowBadge({ icon, children, className })
    case 'green':
      return greenBadge({ icon, children, className })
    case 'red':
      return redBadge({ icon, children, className })
    case 'gray':
      return grayBadge({ icon, children, className })
    case 'blue':
      return blueBadge({ icon, children, className })
    case 'slate':
      return slateBadge({ icon, children, className })
    case 'purple':
      return purpleBadge({ icon, children, className })
    default:
      return <BaseBadge className={className}>{children}</BaseBadge>
  }
}

function BaseBadge ({ icon, children, className, iconClass }: { icon?: Icon, children?: React.ReactNode, className?: string, iconClass?: string }) {
  return (
    <span className={cn('flex items-center gap-2 w-max border rounded-lg px-2 py-0.5 text-xs', className)}>
      {icon && React.cloneElement(icon, { className: cn('w-4 h-4 rounded-full p-0.5', icon.props.className, iconClass) })}
      {children}
    </span>
  )
}

function yellowBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return <BaseBadge icon={icon} className={cn(BADGE_STYLES.yellow.spanClass, className)} iconClass={BADGE_STYLES.yellow.iconClass}>{children}</BaseBadge>
}

function greenBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return <BaseBadge icon={icon} className={cn(BADGE_STYLES.green.spanClass, className)} iconClass={BADGE_STYLES.green.iconClass}>{children}</BaseBadge>
}

function redBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return <BaseBadge icon={icon} className={cn(BADGE_STYLES.red.spanClass, className)} iconClass={BADGE_STYLES.red.iconClass}>{children}</BaseBadge>
}

function grayBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return <BaseBadge icon={icon} className={cn(BADGE_STYLES.gray.spanClass, className)} iconClass={BADGE_STYLES.gray.iconClass}>{children}</BaseBadge>
}

function blueBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return <BaseBadge icon={icon} className={cn(BADGE_STYLES.blue.spanClass, className)} iconClass={BADGE_STYLES.blue.iconClass}>{children}</BaseBadge>
}

function slateBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return <BaseBadge icon={icon} className={cn(BADGE_STYLES.slate.spanClass, className)} iconClass={BADGE_STYLES.slate.iconClass}>{children}</BaseBadge>
}

function purpleBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return <BaseBadge icon={icon} className={cn(BADGE_STYLES.purple.spanClass, className)} iconClass={BADGE_STYLES.purple.iconClass}>{children}</BaseBadge>
}
