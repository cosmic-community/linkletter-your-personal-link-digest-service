import { NextRequest, NextResponse } from 'next/server'
import { getUsers, getLinks, getWeeklyDigests } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'
import { AnalyticsData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const user = await verifyToken(request)
    if (!user || user.subscriptionTier !== 'Paid') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [users, links, digests] = await Promise.all([
      getUsers(),
      getLinks(),
      getWeeklyDigests()
    ])

    // Calculate analytics
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    
    const freeUsers = users.filter(user => {
      const tier = user.metadata.subscription_tier
      const tierValue = typeof tier === 'string' ? tier : tier?.value || 'Free'
      return tierValue === 'Free'
    })

    const paidUsers = users.filter(user => {
      const tier = user.metadata.subscription_tier
      const tierValue = typeof tier === 'string' ? tier : tier?.value || 'Free'
      return tierValue === 'Paid'
    })

    const verifiedUsers = users.filter(user => user.metadata.email_verified)

    const linksThisWeek = links.filter(link => {
      const linkDate = new Date(link.metadata.date_saved)
      return linkDate >= weekStart
    })

    const sentDigests = digests.filter(digest => digest.metadata.email_sent)
    const openedDigests = digests.filter(digest => digest.metadata.email_opened)

    const totalClicks = links.reduce((sum, link) => sum + (link.metadata.click_count || 0), 0)

    const analytics: AnalyticsData = {
      users: {
        total: users.length,
        free: freeUsers.length,
        paid: paidUsers.length,
        verified: verifiedUsers.length
      },
      links: {
        total: links.length,
        thisWeek: linksThisWeek.length,
        totalClicks
      },
      digests: {
        total: digests.length,
        sent: sentDigests.length,
        opened: openedDigests.length
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}