import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  subscriptionTier: string
}

export async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}