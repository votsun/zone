'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListTodo, StickyNote, Settings } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Tasks', href: '/tasks', icon: ListTodo },
    { label: 'Notes', href: '/notes', icon: StickyNote },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t flex sm:hidden">
      <div className="grid h-full w-full grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 transition-colors group ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 group-active:scale-90 transition-transform ${
                isActive ? 'fill-primary/20' : ''
              }`} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}