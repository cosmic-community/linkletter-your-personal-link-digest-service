import { NextRequest, NextResponse } from 'next/server'
import { updateLink, deleteLink } from '@/lib/cosmic'
import { verifyToken } from '@/lib/auth'
import { BulkActionData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BulkActionData = await request.json()
    const { selectedIds, action, value } = body

    if (!selectedIds || selectedIds.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const linkId of selectedIds) {
      try {
        switch (action) {
          case 'delete':
            await deleteLink(linkId)
            results.push({ id: linkId, action: 'deleted' })
            break
          
          case 'archive':
            await updateLink(linkId, {
              metadata: { archived: true }
            } as any)
            results.push({ id: linkId, action: 'archived' })
            break
          
          case 'unarchive':
            await updateLink(linkId, {
              metadata: { archived: false }
            } as any)
            results.push({ id: linkId, action: 'unarchived' })
            break
          
          case 'tag':
            if (!value) {
              errors.push({ id: linkId, error: 'Tag value required' })
              continue
            }
            // Get current link to preserve existing tags
            const currentLink = await updateLink(linkId, {
              metadata: { tags: value }
            } as any)
            results.push({ id: linkId, action: 'tagged' })
            break
          
          default:
            errors.push({ id: linkId, error: 'Invalid action' })
        }
      } catch (error) {
        console.error(`Error processing ${action} for link ${linkId}:`, error)
        errors.push({ 
          id: linkId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: selectedIds.length,
        successful: results.length,
        failed: errors.length
      }
    })
  } catch (error) {
    console.error('Error in bulk action:', error)
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 })
  }
}