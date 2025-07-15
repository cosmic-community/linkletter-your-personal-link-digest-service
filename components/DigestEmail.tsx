import { CosmicWeeklyDigest } from '@/lib/types'

interface DigestEmailProps {
  digest: CosmicWeeklyDigest
}

export function DigestEmail({ digest }: DigestEmailProps) {
  const { user, links = [], week_number, year } = digest.metadata
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Weekly LinkLetter Digest</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .link-item { background: white; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
        .link-url { color: #2563eb; text-decoration: none; font-weight: 500; }
        .link-notes { color: #6b7280; font-size: 14px; margin-top: 8px; }
        .link-tags { margin-top: 8px; }
        .tag { background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Your Weekly LinkLetter Digest</h1>
        <p>Week ${week_number}, ${year} • ${user.metadata.first_name || user.title}</p>
      </div>
      
      <div class="content">
        <p>Here are the links you saved this week:</p>
        
        ${links.map(link => `
          <div class="link-item">
            <a href="${link.metadata.url}" class="link-url">${link.metadata.title || link.title}</a>
            ${link.metadata.notes ? `<div class="link-notes">${link.metadata.notes}</div>` : ''}
            ${link.metadata.tags ? `
              <div class="link-tags">
                ${link.metadata.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="footer">
        <p>This digest was sent from LinkLetter - Your Personal Link Digest Service</p>
        <p>You can update your preferences or unsubscribe at any time.</p>
      </div>
    </body>
    </html>
  `
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Email Preview</h2>
      <div className="border rounded-lg p-4 bg-gray-50">
        <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
      </div>
    </div>
  )
}