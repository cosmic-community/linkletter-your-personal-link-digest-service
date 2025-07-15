import { NextRequest, NextResponse } from 'next/server'
import { getUsers, createUser } from '@/lib/cosmic'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, subscriptionTier = 'Free' } = body
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    
    const user = await createUser({
      title: `${firstName || ''} ${lastName || ''}`.trim() || email,
      email,
      passwordHash,
      firstName,
      lastName,
      subscriptionTier,
    })
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user.metadata
    
    return NextResponse.json({
      ...user,
      metadata: userWithoutPassword,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}