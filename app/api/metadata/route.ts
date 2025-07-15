import { NextRequest, NextResponse } from 'next/server'
import { fetchMetadata } from '@/lib/metadata'
import { verifyToken } from '@/lib/auth'
import { validateUrl } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    if (!validateUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const metadata = await fetchMetadata(url)
    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}