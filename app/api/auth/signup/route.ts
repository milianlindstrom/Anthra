import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Create user
    const passwordHash = hashPassword(password)
    const user = await prisma.user.create({
      data: {
        username,
        password_hash: passwordHash,
        onboarding_completed: false,
      },
    })

    // Create token and set cookie
    const token = await createToken(user.id, user.username)
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        onboarding_completed: user.onboarding_completed,
      },
    })

    return setAuthCookie(response, token)
  } catch (error) {
    console.error('Error signing up:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
