import { NextRequest, NextResponse } from 'next/server'
import { getUsers, getLinks, getWeeklyDigests } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'
import { CosmicUser, CosmicLink } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    
    if (!user || user.subscriptionTier !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [users, links, digests] = await Promise.all([
      getUsers(),
      getLinks(),
      getWeeklyDigests()
    ])

    const analytics = {
      users: {
        total: users.length,
        free: users.filter((u: CosmicUser) => {
          const tier = u.metadata.subscription_tier
          return typeof tier === 'string' ? tier === 'Free' : tier?.value === 'Free'
        }).length,
        paid: users.filter((u: CosmicUser) => {
          const tier = u.metadata.subscription_tier
          return typeof tier === 'string' ? tier === 'Paid' : tier?.value === 'Paid'
        }).length,
        verified: users.filter((u: CosmicUser) => u.metadata.email_verified).length,
      },
      links: {
        total: links.length,
        thisWeek: links.filter((l: CosmicLink) => {
          const linkDate = new Date(l.metadata.date_saved)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return linkDate > weekAgo
        }).length,
        totalClicks: links.reduce((sum: number, l: CosmicLink) => sum + (l.metadata.click_count || 0), 0),
      },
      digests: {
        total: digests.length,
        sent: digests.filter(d => d.metadata.email_sent).length,
        opened: digests.filter(d => d.metadata.email_opened).length,
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}