import mailgun from 'mailgun-js'
import { CosmicUser, CosmicLink } from './types'

// Lazy initialization of Mailgun client
let mgClient: mailgun.Mailgun | null = null

function getMailgunClient(): mailgun.Mailgun {
  if (!mgClient) {
    const apiKey = process.env.MAILGUN_API_KEY
    const domain = process.env.MAILGUN_DOMAIN
    
    if (!apiKey) {
      throw new Error('MAILGUN_API_KEY environment variable is required')
    }
    
    if (!domain) {
      throw new Error('MAILGUN_DOMAIN environment variable is required')
    }
    
    mgClient = mailgun({
      apiKey,
      domain
    })
  }
  
  return mgClient
}

export async function sendDigestEmail(
  user: CosmicUser,
  links: CosmicLink[],
  weekNumber: number,
  year: number
): Promise<void> {
  const mg = getMailgunClient()
  const emailHtml = generateDigestEmailHTML(user, links, weekNumber, year)
  
  const data = {
    from: `LinkLetter <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: user.metadata.email,
    subject: `Your Weekly LinkLetter Digest - Week ${weekNumber}`,
    html: emailHtml,
  }

  return new Promise((resolve, reject) => {
    mg.messages().send(data, (error, body) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

function generateDigestEmailHTML(
  user: CosmicUser,
  links: CosmicLink[],
  weekNumber: number,
  year: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Weekly LinkLetter Digest</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6; }
        .container { background-color: white; padding: 30px; border-radius: 8px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .link-item { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; border-radius: 6px; }
        .link-url { color: #2563eb; text-decoration: none; font-weight: 500; font-size: 16px; }
        .link-url:hover { text-decoration: underline; }
        .link-notes { color: #6b7280; font-size: 14px; margin-top: 8px; line-height: 1.4; }
        .link-tags { margin-top: 8px; }
        .tag { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
        .stats { background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Weekly LinkLetter Digest</h1>
          <p>Week ${weekNumber}, ${year} • ${user.metadata.first_name || user.title}</p>
        </div>
        
        <div class="stats">
          <strong>📊 This Week's Stats:</strong> You saved ${links.length} link${links.length === 1 ? '' : 's'}
        </div>
        
        <div class="content">
          <h2>🔗 Your Links This Week</h2>
          
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
          <p>📧 This digest was sent from <strong>LinkLetter</strong> - Your Personal Link Digest Service</p>
          <p>You can update your preferences or unsubscribe at any time in your <a href="${process.env.APP_URL}/settings">settings</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `
}