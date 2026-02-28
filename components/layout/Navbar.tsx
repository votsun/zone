'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, LayoutDashboard, BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo / Home Link */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary p-1 rounded-md">
            <BrainCircuit className="h-6 w-6 text-primary-foreground" />
          </div>
          <span>Zone</span>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <Link href="/history">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <LayoutDashboard className="h-4 w-4" />
              History
            </Button>
          </Link>
          
          {/* The Big Plus Button */}
          <Link href="/new-task">
            <Button size="sm" className="gap-2 rounded-full px-4 shadow-md transition-transform hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}