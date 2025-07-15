import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/cosmic'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { CosmicUser } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user by email
    const users = await getUsers()
    const user = users.find((u: CosmicUser) => u.metadata.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.metadata.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.metadata.email,
        subscriptionTier: user.metadata.subscription_tier.value
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    )

    // Create response without password
    const { password_hash, ...userWithoutPassword } = user.metadata

    const response = NextResponse.json({
      user: {
        ...user,
        metadata: userWithoutPassword
      },
      token
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}