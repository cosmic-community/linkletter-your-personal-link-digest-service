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
    
    // Check environment variables
    if (!process.env.COSMIC_BUCKET_SLUG || !process.env.COSMIC_READ_KEY || !process.env.COSMIC_WRITE_KEY) {
      console.error('Missing Cosmic CMS environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (!process.env.JWT_SECRET) {
      console.error('Missing JWT_SECRET environment variable')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Check if user already exists
    console.log('Checking if user exists...')
    const users = await getUsers()
    const existingUser = users.find((u: CosmicUser) => u.metadata.email === email)
    
    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    console.log('User does not exist, proceeding with creation')

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully')

    // Create user with correct subscription tier value
    const user = await createUser({
      title: `${firstName || ''} ${lastName || ''}`.trim() || email,
      email,
      passwordHash,
      firstName,
      lastName,
      subscriptionTier: 'free' // Use the key, not the value
    })

    console.log('User created successfully:', user.id)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.metadata.email,
        subscriptionTier: user.metadata.subscription_tier.value
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

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

    console.log('Registration completed successfully')
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}