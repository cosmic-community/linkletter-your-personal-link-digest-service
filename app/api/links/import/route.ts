import { NextRequest, NextResponse } from 'next/server'
import { createLink } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'
import { ImportData } from '@/lib/types'
import { validateUrl } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ImportData = await request.json()
    const { source, data } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid import data' }, { status: 400 })
    }

    const results = []
    const errors = []
    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    for (const item of data) {
      try {
        let linkData: any = null

        switch (source) {
          case 'pocket':
            linkData = {
              title: item.resolved_title || item.given_title || item.resolved_url,
              url: item.resolved_url || item.given_url,
              notes: item.excerpt || '',
              tags: item.tags ? Object.keys(item.tags).join(', ') : '',
              dateSaved: item.time_added ? new Date(parseInt(item.time_added) * 1000).toISOString() : now.toISOString(),
            }
            break

          case 'browser':
            linkData = {
              title: item.title || item.url,
              url: item.url,
              notes: item.description || '',
              tags: item.tags || '',
              dateSaved: item.date_added ? new Date(item.date_added).toISOString() : now.toISOString(),
            }
            break

          case 'csv':
            linkData = {
              title: item.title || item.url,
              url: item.url,
              notes: item.notes || item.description || '',
              tags: item.tags || '',
              dateSaved: item.date_saved ? new Date(item.date_saved).toISOString() : now.toISOString(),
            }
            break

          default:
            errors.push({ item, error: 'Unsupported import source' })
            continue
        }

        if (!linkData.url || !validateUrl(linkData.url)) {
          errors.push({ item, error: 'Invalid URL' })
          continue
        }

        const link = await createLink({
          title: linkData.title,
          url: linkData.url,
          notes: linkData.notes,
          tags: linkData.tags,
          userId: user.userId,
          dateSaved: linkData.dateSaved,
          weekNumber,
          year,
        })

        results.push({ 
          original: item, 
          imported: link,
          action: 'imported' 
        })
      } catch (error) {
        console.error('Error importing item:', error)
        errors.push({ 
          item, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: data.length,
        successful: results.length,
        failed: errors.length,
        source
      }
    })
  } catch (error) {
    console.error('Error in import:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}