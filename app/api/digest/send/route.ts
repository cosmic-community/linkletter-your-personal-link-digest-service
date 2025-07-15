import { NextRequest, NextResponse } from 'next/server'
import { getUsers, getLinks, createBucketClient } from '@/lib/cosmic'
import { sendDigestEmail } from '@/lib/email'
import { getWeekNumber } from '@/lib/utils'
import { CosmicUser, CosmicLink } from '@/lib/types'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG || '',
  readKey: process.env.COSMIC_READ_KEY || '',
  writeKey: process.env.COSMIC_WRITE_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const users = await getUsers()
    const links = await getLinks()
    
    const currentWeek = getWeekNumber(new Date())
    const currentYear = new Date().getFullYear()
    
    const digestsSent = []
    
    for (const user of users) {
      if (!user.metadata.preferences?.email_notifications) {
        continue
      }
      
      // Get user's links for this week
      const userLinks = links.filter((link: CosmicLink) => 
        typeof link.metadata.user === 'object' 
          ? link.metadata.user.id === user.id 
          : link.metadata.user === user.id &&
        link.metadata.week_number === currentWeek &&
        link.metadata.year === currentYear
      )
      
      if (userLinks.length === 0) {
        continue
      }
      
      // Create digest record
      const digest = await cosmic.objects.insertOne({
        title: `${user.title}'s Week ${currentWeek} Digest`,
        type: 'weekly-digests',
        metadata: {
          user: user.id,
          week_number: currentWeek,
          year: currentYear,
          links: userLinks.map(l => l.id),
          email_sent: false,
          send_date: new Date().toISOString(),
        }
      })
      
      // Send email
      try {
        await sendDigestEmail(user, userLinks, currentWeek, currentYear)
        
        // Update digest as sent
        await cosmic.objects.updateOne(digest.object.id, {
          metadata: {
            ...digest.object.metadata,
            email_sent: true,
          }
        })
        
        digestsSent.push({
          user: user.metadata.email,
          linkCount: userLinks.length
        })
      } catch (emailError) {
        console.error(`Failed to send digest to ${user.metadata.email}:`, emailError)
      }
    }
    
    return NextResponse.json({
      message: `Sent ${digestsSent.length} digests`,
      digests: digestsSent
    })
  } catch (error) {
    console.error('Digest send error:', error)
    return NextResponse.json({ error: 'Failed to send digests' }, { status: 500 })
  }
}