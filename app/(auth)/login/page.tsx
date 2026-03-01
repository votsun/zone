'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

function getCallbackUrl() {
  if (typeof window === 'undefined') return undefined
  return new URL('/callback', window.location.origin).toString()
}

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const nextPath = useMemo(() => {
    const next = searchParams.get('next')
    if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard'
    return next
  }, [searchParams])

  async function handleEmailAuth() {
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const callbackUrl = getCallbackUrl()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: callbackUrl
          ? {
              emailRedirectTo: `${callbackUrl}?next=${encodeURIComponent(nextPath)}`,
            }
          : undefined,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a confirmation link.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push(nextPath)
        router.refresh()
      }
    }

    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')

    const callbackUrl = getCallbackUrl()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: callbackUrl
        ? {
            redirectTo: `${callbackUrl}?next=${encodeURIComponent(nextPath)}`,
          }
        : undefined,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-md p-8 space-y-6 rounded-2xl border border-border shadow-sm bg-background">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold">Zone</h1>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-2">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-50"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setMessage('')
            }}
            className="text-primary underline underline-offset-2"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}