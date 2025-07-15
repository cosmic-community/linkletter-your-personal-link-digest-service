import { NextRequest, NextResponse } from 'next/server'
import { getAppSettings } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const settings = await getAppSettings()
    
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    // Only return public settings
    const publicSettings = {
      siteName: settings.metadata.site_name,
      freeTierLinkLimit: settings.metadata.free_tier_link_limit,
      digestSendDay: settings.metadata.digest_send_day,
      featuresEnabled: settings.metadata.features_enabled
    }

    return NextResponse.json(publicSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}