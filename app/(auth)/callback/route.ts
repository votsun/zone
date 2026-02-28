import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeRedirectPath(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith('/')) return '/dashboard'
  if (nextParam.startsWith('//')) return '/dashboard'
  return nextParam
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeRedirectPath(requestUrl.searchParams.get('next'))
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(new URL(next, origin))
}