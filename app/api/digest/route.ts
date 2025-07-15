import { NextRequest, NextResponse } from 'next/server'
import { getWeeklyDigests } from '@/lib/cosmic'

export async function GET() {
  try {
    const digests = await getWeeklyDigests()
    return NextResponse.json(digests)
  } catch (error) {
    console.error('Error fetching digests:', error)
    return NextResponse.json({ error: 'Failed to fetch digests' }, { status: 500 })
  }
}