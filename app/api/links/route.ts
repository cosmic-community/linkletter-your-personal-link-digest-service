import { NextRequest, NextResponse } from 'next/server'
import { getLinks, createLink } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'
import { validateUrl } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''
    const sortBy = searchParams.get('sortBy') || 'date'
    const archived = searchParams.get('archived') === 'true'

    const links = await getLinks()
    
    // Filter links by user
    let userLinks = links.filter(link => {
      const linkUser = link.metadata.user
      const userId = typeof linkUser === 'string' ? linkUser : linkUser?.id
      return userId === user.userId
    })

    // Apply filters
    if (search) {
      userLinks = userLinks.filter(link => 
        link.title.toLowerCase().includes(search.toLowerCase()) ||
        link.metadata.url.toLowerCase().includes(search.toLowerCase()) ||
        link.metadata.notes?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (tag) {
      userLinks = userLinks.filter(link => 
        link.metadata.tags?.toLowerCase().includes(tag.toLowerCase())
      )
    }

    if (archived !== undefined) {
      userLinks = userLinks.filter(link => link.metadata.archived === archived)
    }

    // Sort links
    userLinks.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'clicks':
          return (b.metadata.click_count || 0) - (a.metadata.click_count || 0)
        case 'date':
        default:
          return new Date(b.metadata.date_saved).getTime() - new Date(a.metadata.date_saved).getTime()
      }
    })

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLinks = userLinks.slice(startIndex, endIndex)

    return NextResponse.json({
      links: paginatedLinks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(userLinks.length / limit),
        totalItems: userLinks.length,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, url, notes, tags } = body
    
    // Validate required fields
    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
    }

    // Validate URL format
    if (!validateUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }
    
    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()
    
    const link = await createLink({
      title,
      url,
      notes: notes || '',
      tags: tags || '',
      userId: user.userId,
      dateSaved: now.toISOString(),
      weekNumber,
      year,
    })
    
    return NextResponse.json(link)
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}