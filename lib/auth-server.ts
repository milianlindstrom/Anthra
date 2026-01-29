import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './db'
import * as crypto from 'crypto'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

// Hash password using SHA-256 (simple for local auth, use bcrypt in production)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Create JWT token
export async function createToken(userId: string, username: string): Promise<string> {
  const token = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
  
  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<{ userId: string; username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    }
  } catch (error) {
    return null
  }
}

// Verify token without database lookup (for middleware/edge runtime)
export async function verifyTokenOnly(request: NextRequest | Request | { cookies: { get: (name: string) => { value: string | null } } }): Promise<{ userId: string; username: string } | null> {
  // Handle different request types
  const cookies = 'cookies' in request ? request.cookies : { get: (name: string) => ({ value: null }) }
  const token = cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  return await verifyToken(token)
}

// Get user from request (from cookie) - requires database access
export async function getUserFromRequest(request: NextRequest | Request | { cookies: { get: (name: string) => { value: string | null } } }): Promise<{ id: string; username: string; onboarding_completed: boolean } | null> {
  // Handle different request types
  const cookies = 'cookies' in request ? request.cookies : { get: (name: string) => ({ value: null }) }
  const token = cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, onboarding_completed: true },
  })
  
  return user
}

// Set auth cookie
export function setAuthCookie(response: NextResponse, token: string) {
  // Only use secure flag when explicitly on HTTPS
  // In development/local HTTP, secure cookies are rejected by browsers
  const useSecure = process.env.NEXT_PUBLIC_HTTPS === 'true' || process.env.HTTPS === 'true'
  
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: useSecure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return response
}

// Clear auth cookie
export function clearAuthCookie(response: NextResponse) {
  // Only use secure flag when explicitly on HTTPS
  const useSecure = process.env.NEXT_PUBLIC_HTTPS === 'true' || process.env.HTTPS === 'true'
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: useSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
