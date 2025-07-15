import { createBucketClient } from '@cosmicjs/sdk'
import { CosmicLink, CosmicUser, CosmicWeeklyDigest, CosmicAppSettings } from './types'

// Initialize Cosmic client
export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG || '',
  readKey: process.env.COSMIC_READ_KEY || '',
  writeKey: process.env.COSMIC_WRITE_KEY || '',
})

// Export createBucketClient for use in other files
export { createBucketClient }

export async function getLinks(): Promise<CosmicLink[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'links' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return response.objects as CosmicLink[]
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function getUsers(): Promise<CosmicUser[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'users' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return response.objects as CosmicUser[]
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function getUserById(id: string): Promise<CosmicUser | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'users', id })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return response.object as CosmicUser
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<CosmicUser | null> {
  try {
    const users = await getUsers()
    return users.find(user => user.metadata.email === email) || null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

export async function getWeeklyDigests(): Promise<CosmicWeeklyDigest[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'weekly-digests' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return response.objects as CosmicWeeklyDigest[]
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function getAppSettings(): Promise<CosmicAppSettings | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'app-settings' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return response.object as CosmicAppSettings
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function createLink(linkData: {
  title: string
  url: string
  notes?: string
  tags?: string
  userId: string
  dateSaved: string
  weekNumber: number
  year: number
}): Promise<CosmicLink> {
  const response = await cosmic.objects.insertOne({
    title: linkData.title,
    type: 'links',
    metadata: {
      url: linkData.url,
      title: linkData.title,
      notes: linkData.notes || '',
      tags: linkData.tags || '',
      user: linkData.userId,
      date_saved: linkData.dateSaved,
      week_number: linkData.weekNumber,
      year: linkData.year,
      archived: false,
      click_count: 0,
    },
  })
  
  return response.object as CosmicLink
}

export async function updateLink(linkId: string, linkData: Partial<CosmicLink>): Promise<CosmicLink> {
  const response = await cosmic.objects.updateOne(linkId, {
    metadata: linkData.metadata,
  })
  
  return response.object as CosmicLink
}

export async function deleteLink(linkId: string): Promise<void> {
  await cosmic.objects.deleteOne(linkId)
}

export async function createUser(userData: {
  title: string
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  subscriptionTier: string
}): Promise<CosmicUser> {
  const response = await cosmic.objects.insertOne({
    title: userData.title,
    type: 'users',
    metadata: {
      email: userData.email,
      password_hash: userData.passwordHash,
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      subscription_tier: userData.subscriptionTier, // This will be the key ('free' or 'paid')
      weekly_link_count: 0,
      email_verified: false,
      account_created: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      preferences: {
        email_notifications: true,
        digest_time: '09:00',
        timezone: 'America/New_York',
        pocket_integration: false,
      },
    },
  })
  
  return response.object as CosmicUser
}

export async function updateUser(userId: string, userData: Partial<CosmicUser>): Promise<CosmicUser> {
  const response = await cosmic.objects.updateOne(userId, {
    metadata: userData.metadata,
  })
  
  return response.object as CosmicUser
}