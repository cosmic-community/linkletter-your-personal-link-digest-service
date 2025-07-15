import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    
    if (!user || user.subscriptionTier !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await getUsers()
    
    // Remove password hashes from response
    const safeUsers = users.map(user => ({
      ...user,
      metadata: {
        ...user.metadata,
        password_hash: undefined
      }
    }))

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}