import { NextRequest, NextResponse } from 'next/server'
import { getLinks } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'
import { SearchResult, CosmicLink } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const allLinks = await getLinks()
    
    // Filter links by user
    let userLinks = allLinks.filter(link => {
      const linkUser = link.metadata.user
      const userId = typeof linkUser === 'string' ? linkUser : linkUser?.id
      return userId === user.userId
    })

    // Search functionality
    const searchTerms = query.toLowerCase().split(' ')
    const matchedLinks = userLinks.filter(link => {
      const searchableText = `${link.title} ${link.metadata.url} ${link.metadata.notes} ${link.metadata.tags}`.toLowerCase()
      return searchTerms.every(term => searchableText.includes(term))
    })

    // Sort by relevance (simple scoring)
    const scoredLinks = matchedLinks.map(link => {
      let score = 0
      const titleMatch = link.title.toLowerCase().includes(query.toLowerCase())
      const urlMatch = link.metadata.url.toLowerCase().includes(query.toLowerCase())
      const notesMatch = link.metadata.notes?.toLowerCase().includes(query.toLowerCase())
      
      if (titleMatch) score += 3
      if (urlMatch) score += 2
      if (notesMatch) score += 1
      
      return { ...link, score }
    }).sort((a, b) => b.score - a.score)

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLinks = scoredLinks.slice(startIndex, endIndex)

    // Generate facets
    const allTags = Array.from(
      new Set(
        matchedLinks
          .filter(link => link.metadata.tags)
          .flatMap(link => link.metadata.tags?.split(',').map(tag => tag.trim()) || [])
      )
    ).map(tag => ({
      tag,
      count: matchedLinks.filter(link => link.metadata.tags?.includes(tag)).length
    }))

    const result: SearchResult = {
      links: paginatedLinks,
      total: matchedLinks.length,
      facets: {
        tags: allTags.slice(0, 10), // Top 10 tags
        users: [] // Not needed for single user search
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error searching links:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}