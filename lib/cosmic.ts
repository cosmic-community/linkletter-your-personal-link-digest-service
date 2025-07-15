import { createBucketClient } from '@cosmicjs/sdk'
import { CosmicLink, CosmicUser, CosmicWeeklyDigest, CosmicAppSettings } from './types'

// Validate environment variables on module load
const validateEnvironment = () => {
  const required = ['COSMIC_BUCKET_SLUG', 'COSMIC_READ_KEY', 'COSMIC_WRITE_KEY']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

// Initialize with validation
let cosmic: any
try {
  validateEnvironment()
  cosmic = createBucketClient({
    bucketSlug: process.env.COSMIC_BUCKET_SLUG!,
    readKey: process.env.COSMIC_READ_KEY!,
    writeKey: process.env.COSMIC_WRITE_KEY!,
    apiEnvironment: "staging"
  })
} catch (error) {
  console.error('Cosmic client initialization failed:', error)
  throw error
}

// Export both createBucketClient and cosmic instance
export { createBucketClient, cosmic }

export async function getLinks(): Promise<CosmicLink[]> {
  try {
    console.log('Fetching links from Cosmic CMS...')
    const response = await cosmic.objects
      .find({ type: 'links' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    console.log('Links fetched successfully:', response.objects.length)
    return response.objects as CosmicLink[]
  } catch (error) {
    console.error('Error fetching links:', error)
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      console.log('No links found, returning empty array')
      return []
    }
    throw error
  }
}

export async function getUsers(): Promise<CosmicUser[]> {
  try {
    console.log('Fetching users from Cosmic CMS...')
    const response = await cosmic.objects
      .find({ type: 'users' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    console.log('Users fetched successfully:', response.objects.length)
    return response.objects as CosmicUser[]
  } catch (error) {
    console.error('Error fetching users:', error)
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      console.log('No users found, returning empty array')
      return []
    }
    throw error
  }
}

export async function getUserById(id: string): Promise<CosmicUser | null> {
  try {
    console.log('Fetching user by ID:', id)
    const response = await cosmic.objects
      .findOne({ type: 'users', id })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    console.log('User fetched successfully:', response.object.id)
    return response.object as CosmicUser
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      console.log('User not found')
      return null
    }
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<CosmicUser | null> {
  try {
    console.log('Fetching user by email:', email)
    const users = await getUsers()
    const user = users.find(user => user.metadata.email === email) || null
    console.log('User by email result:', user ? 'found' : 'not found')
    return user
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

export async function getWeeklyDigests(): Promise<CosmicWeeklyDigest[]> {
  try {
    console.log('Fetching weekly digests from Cosmic CMS...')
    const response = await cosmic.objects
      .find({ type: 'weekly-digests' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    console.log('Weekly digests fetched successfully:', response.objects.length)
    return response.objects as CosmicWeeklyDigest[]
  } catch (error) {
    console.error('Error fetching weekly digests:', error)
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      console.log('No weekly digests found, returning empty array')
      return []
    }
    throw error
  }
}

export async function getAppSettings(): Promise<CosmicAppSettings | null> {
  try {
    console.log('Fetching app settings from Cosmic CMS...')
    const response = await cosmic.objects
      .findOne({ type: 'app-settings' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    console.log('App settings fetched successfully')
    return response.object as CosmicAppSettings
  } catch (error) {
    console.error('Error fetching app settings:', error)
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      console.log('App settings not found')
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
  try {
    console.log('Creating link in Cosmic CMS...')
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
    
    console.log('Link created successfully:', response.object.id)
    return response.object as CosmicLink
  } catch (error) {
    console.error('Error creating link:', error)
    throw error
  }
}

export async function updateLink(linkId: string, linkData: Partial<CosmicLink>): Promise<CosmicLink> {
  try {
    console.log('Updating link in Cosmic CMS:', linkId)
    const response = await cosmic.objects.updateOne(linkId, {
      metadata: linkData.metadata,
    })
    
    console.log('Link updated successfully')
    return response.object as CosmicLink
  } catch (error) {
    console.error('Error updating link:', error)
    throw error
  }
}

export async function deleteLink(linkId: string): Promise<void> {
  try {
    console.log('Deleting link from Cosmic CMS:', linkId)
    await cosmic.objects.deleteOne(linkId)
    console.log('Link deleted successfully')
  } catch (error) {
    console.error('Error deleting link:', error)
    throw error
  }
}

export async function createUser(userData: {
  title: string
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  subscriptionTier: string
}): Promise<CosmicUser> {
  try {
    console.log('Creating user in Cosmic CMS...')
    const response = await cosmic.objects.insertOne({
      title: userData.title,
      type: 'users',
      metadata: {
        email: userData.email,
        password_hash: userData.passwordHash,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        subscription_tier: userData.subscriptionTier, // Use the display value
        weekly_link_count: 0,
        email_verified: false,
        account_created: new Date().toISOString().split('T')[0],
        preferences: {
          email_notifications: true,
          digest_time: '09:00',
          timezone: 'America/New_York',
          pocket_integration: false,
        },
      },
    })
    
    console.log('User created successfully:', response.object.id)
    return response.object as CosmicUser
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(userId: string, userData: Partial<CosmicUser>): Promise<CosmicUser> {
  try {
    console.log('Updating user in Cosmic CMS:', userId)
    const response = await cosmic.objects.updateOne(userId, {
      metadata: userData.metadata,
    })
    
    console.log('User updated successfully')
    return response.object as CosmicUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}