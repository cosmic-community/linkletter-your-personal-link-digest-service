import { NextRequest, NextResponse } from 'next/server'
import { getUsers, createUser } from '@/lib/cosmic'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { CosmicUser } from '@/lib/types'
import { validateEmail, validatePassword } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    console.log('Registration attempt started')
    
    const { email, password, firstName, lastName } = await request.json()
    
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

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      console.log('Password validation failed:', passwordValidation.errors)
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 })
    }

    console.log('Input validation passed')
    
    // Check environment variables with detailed error logging
    const missingEnvVars = []
    if (!process.env.COSMIC_BUCKET_SLUG) missingEnvVars.push('COSMIC_BUCKET_SLUG')
    if (!process.env.COSMIC_READ_KEY) missingEnvVars.push('COSMIC_READ_KEY')
    if (!process.env.COSMIC_WRITE_KEY) missingEnvVars.push('COSMIC_WRITE_KEY')
    if (!process.env.JWT_SECRET) missingEnvVars.push('JWT_SECRET')

    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars)
      return NextResponse.json({ 
        error: 'Server configuration error: Missing environment variables',
        details: process.env.NODE_ENV === 'development' ? missingEnvVars : undefined
      }, { status: 500 })
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET!.length < 32) {
      console.error('JWT_SECRET is too short')
      return NextResponse.json({ error: 'Server configuration error: JWT secret too weak' }, { status: 500 })
    }

    // Check if user already exists
    console.log('Checking if user exists...')
    let users: CosmicUser[] = []
    try {
      users = await getUsers()
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
    }

    const existingUser = users.find((u: CosmicUser) => u.metadata.email === email)
    
    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    console.log('User does not exist, proceeding with creation')

    // Hash password
    let passwordHash: string
    try {
      passwordHash = await bcrypt.hash(password, 12)
      console.log('Password hashed successfully')
    } catch (error) {
      console.error('Password hashing error:', error)
      return NextResponse.json({ error: 'Password processing error' }, { status: 500 })
    }

    // Create user with correct subscription tier value
    let user: CosmicUser
    try {
      user = await createUser({
        title: `${firstName || ''} ${lastName || ''}`.trim() || email,
        email,
        passwordHash,
        firstName,
        lastName,
        subscriptionTier: 'Free' // Use the display value from the dropdown
      })
      console.log('User created successfully:', user.id)
    } catch (error) {
      console.error('User creation error:', error)
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    // Generate JWT token
    let token: string
    try {
      const subscriptionTier = user.metadata.subscription_tier
      const tierValue = typeof subscriptionTier === 'string' ? subscriptionTier : subscriptionTier?.value || 'Free'
      
      token = jwt.sign(
        { 
          userId: user.id, 
          email: user.metadata.email,
          subscriptionTier: tierValue
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )
      console.log('JWT token generated')
    } catch (error) {
      console.error('JWT generation error:', error)
      return NextResponse.json({ error: 'Authentication token generation failed' }, { status: 500 })
    }

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

    console.log('Registration completed successfully')
    return response
  } catch (error: unknown) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}