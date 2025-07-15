import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/cosmic'
import { verifyPassword, generateToken } from '@/lib/auth'
import { validateEmail } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started')
    
    const { email, password } = await request.json()
    
    // Validate input
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password })
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(email)) {
      console.log('Invalid email format:', email)
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    console.log('Input validation passed')
    
    // Find user by email
    const user = await getUserByEmail(email)
    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('User found:', user.id)

    // Verify password
    const isValidPassword = await verifyPassword(password, user.metadata.password_hash)
    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('Password verified successfully')

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.metadata.email,
      subscriptionTier: user.metadata.subscription_tier.value
    })

    console.log('JWT token generated')

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

    console.log('Login completed successfully')
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}