import { NextRequest, NextResponse } from 'next/server'
import { getUsers, updateUser } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const user = await verifyToken(request)
    if (!user || user.subscriptionTier !== 'Paid') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await getUsers()
    
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      ...user,
      metadata: {
        ...user.metadata,
        password_hash: undefined
      }
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const user = await verifyToken(request)
    if (!user || user.subscriptionTier !== 'Paid') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, updates } = await request.json()

    if (!userId || !updates) {
      return NextResponse.json({ error: 'User ID and updates are required' }, { status: 400 })
    }

    const updatedUser = await updateUser(userId, { metadata: updates })
    
    // Remove sensitive data
    const { password_hash, ...sanitizedMetadata } = updatedUser.metadata
    
    return NextResponse.json({
      ...updatedUser,
      metadata: sanitizedMetadata
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}