'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
      className="fixed right-4 top-4 z-20 rounded-full border border-white/30 bg-white/85 px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur hover:bg-white disabled:opacity-60"
      aria-label="Logout"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  )
}
