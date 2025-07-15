import { MetadataFetchResult } from './types'

export async function fetchMetadata(url: string): Promise<MetadataFetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkLetter/1.0; +https://linkletter.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    
    // Extract metadata using regex (basic implementation)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
                           html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)

    return {
      title: titleMatch ? titleMatch[1].trim() : new URL(url).hostname,
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      image: imageMatch ? imageMatch[1].trim() : undefined,
      url
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    
    // Return basic metadata if fetch fails
    return {
      title: new URL(url).hostname,
      description: '',
      url
    }
  }
}