'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const HIDDEN_PATHS = ['/login', '/callback']

export function PersistentLogoutButton() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (HIDDEN_PATHS.includes(pathname)) {
    return null
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isLoggingOut}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'fixed right-4 top-4 z-20 rounded-full border-white/30 bg-white/85 font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-white/85 dark:hover:bg-white/95'
      )}
      aria-label="Logout"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  )
}
