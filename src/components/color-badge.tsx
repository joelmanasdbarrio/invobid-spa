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
  slate: {
    spanClass: 'flex items-center gap-2 w-min border border-slate-300/10 rounded-lg px-2 py-0.5 text-xs text-slate-600 bg-slate-300/10 dark:text-slate-400 dark:bg-slate-300/20',
    iconClass: 'w-4 h-4 rounded-full text-slate-600 bg-slate-300/10 dark:text-slate-400 dark:bg-slate-300/20 p-0.5'
  },
  purple: {
    spanClass: 'flex items-center gap-2 w-min border border-violet-300/10 rounded-lg px-2 py-0.5 text-xs text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20',
    iconClass: 'w-4 h-4 rounded-full text-violet-600 bg-violet-300/10 dark:text-violet-400 dark:bg-violet-300/20 p-0.5'
  }
} as const

export default function ColorBadge ({ color, icon, children, className }: ColorBadgeProps) {
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
      return (
        <span className='flex items-center gap-2 w-min border rounded-lg px-2 py-0.5 text-xs'>
          {children}
        </span>
      )
  }
}

function yellowBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return (
    <span className={cn(BADGE_STYLES.yellow.spanClass, className)}>
      {icon && React.cloneElement(icon, { className: cn(icon.props.className, BADGE_STYLES.yellow.iconClass) })}
      {children}
    </span>
  )
}

function greenBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return (
    <span className={cn(BADGE_STYLES.green.spanClass, className)}>
      {icon && React.cloneElement(icon, { className: cn(icon.props.className, BADGE_STYLES.green.iconClass) })}
      {children}
    </span>
  )
}

function redBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return (
    <span className={cn(BADGE_STYLES.red.spanClass, className)}>
      {icon && React.cloneElement(icon, { className: cn(icon.props.className, BADGE_STYLES.red.iconClass) })}
      {children}
    </span>
  )
}

function grayBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return (
    <span className={cn(BADGE_STYLES.gray.spanClass, className)}>
      {icon && React.cloneElement(icon, { className: cn(icon.props.className, BADGE_STYLES.gray.iconClass) })}
      {children}
    </span>
  )
}

function blueBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return (
    <span className={cn(BADGE_STYLES.blue.spanClass, className)}>
      {icon && React.cloneElement(icon, { className: cn(icon.props.className, BADGE_STYLES.blue.iconClass) })}
      {children}
    </span>
  )
}

function slateBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return (
    <span className={cn(BADGE_STYLES.slate.spanClass, className)}>
      {icon && React.cloneElement(icon, { className: cn(icon.props.className, BADGE_STYLES.slate.iconClass) })}
      {children}
    </span>
  )
}

function purpleBadge ({icon, children, className}: {icon?: Icon, children?: React.ReactNode, className?: string}) {
  return (
    <span className={cn(BADGE_STYLES.purple.spanClass, className)}>
      {icon && React.cloneElement(icon, { className: cn(icon.props.className, BADGE_STYLES.purple.iconClass) })}
      {children}
    </span>
  )
}
