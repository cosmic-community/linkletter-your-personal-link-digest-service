import { Metadata } from 'next'

interface MetadataOptions {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: string
  siteName?: string
  locale?: string
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
}

export interface MetadataFetchResult {
  title: string
  description: string
  image?: string
  url: string
  favicon?: string
  siteName?: string
}

export function generateMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title = 'LinkLetter - Your Personal Link Digest Service',
    description = 'Save, organize, and get weekly digests of your favorite links. LinkLetter helps you curate and rediscover the best content from around the web.',
    keywords = ['bookmarks', 'links', 'digest', 'curation', 'productivity', 'web', 'organization'],
    image = '/og-image.jpg',
    url = 'https://linkletter.app',
    type = 'website',
    siteName = 'LinkLetter',
    locale = 'en_US',
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags
  } = options

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale,
      type: type as any,
    },
    
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [image],
      site: '@linkletter',
      creator: '@linkletter',
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }

  // Add article-specific metadata if provided
  if (publishedTime && metadata.openGraph) {
    (metadata.openGraph as any).publishedTime = publishedTime
  }
  
  if (modifiedTime && metadata.openGraph) {
    (metadata.openGraph as any).modifiedTime = modifiedTime
  }
  
  if (authors && metadata.openGraph) {
    (metadata.openGraph as any).authors = authors
  }
  
  if (section && metadata.openGraph) {
    (metadata.openGraph as any).section = section
  }
  
  if (tags && metadata.openGraph) {
    (metadata.openGraph as any).tags = tags
  }

  return metadata
}

export function generatePageMetadata(
  title: string,
  description?: string,
  additionalOptions?: Partial<MetadataOptions>
): Metadata {
  const fullTitle = `${title} | LinkLetter`
  
  return generateMetadata({
    title: fullTitle,
    description: description || 'LinkLetter - Your Personal Link Digest Service',
    ...additionalOptions
  })
}

export function generateArticleMetadata(
  title: string,
  description: string,
  options: {
    publishedTime?: string
    modifiedTime?: string
    authors?: string[]
    section?: string
    tags?: string[]
    image?: string
  } = {}
): Metadata {
  return generateMetadata({
    title: `${title} | LinkLetter`,
    description,
    type: 'article',
    ...options
  })
}

export async function fetchMetadata(url: string): Promise<MetadataFetchResult> {
  try {
    const response = await fetch(url)
    const html = await response.text()
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch?.[1]?.trim() || url

    // Extract description
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
                            html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)
    const description = descriptionMatch?.[1]?.trim() || ''

    // Extract image
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)
    const image = imageMatch?.[1]?.trim() || undefined

    // Extract site name
    const siteNameMatch = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i)
    const siteName = siteNameMatch?.[1]?.trim() || undefined

    // Extract favicon
    const faviconMatch = html.match(/<link[^>]*rel="icon"[^>]*href="([^"]*)"[^>]*>/i) ||
                        html.match(/<link[^>]*rel="shortcut icon"[^>]*href="([^"]*)"[^>]*>/i)
    const favicon = faviconMatch?.[1]?.trim() || undefined

    return {
      title,
      description,
      image,
      url,
      favicon,
      siteName
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return {
      title: url,
      description: '',
      url
    }
  }
}