import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  return NextResponse.json({ user })
}
