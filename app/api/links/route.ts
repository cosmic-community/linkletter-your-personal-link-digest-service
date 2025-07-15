import { NextRequest, NextResponse } from 'next/server'
import { getLinks, createLink } from '@/lib/cosmic'

export async function GET() {
  try {
    const links = await getLinks()
    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, url, notes, tags, userId } = body
    
    if (!title || !url || !userId) {
      return NextResponse.json({ error: 'Title, URL, and userId are required' }, { status: 400 })
    }
    
    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()
    
    const link = await createLink({
      title,
      url,
      notes,
      tags,
      userId,
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