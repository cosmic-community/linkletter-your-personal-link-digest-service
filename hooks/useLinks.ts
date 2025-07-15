'use client'

import { useState, useEffect } from 'react'
import { CosmicLink, PaginationData } from '@/lib/types'

interface UseLinkOptions {
  page?: number
  limit?: number
  search?: string
  tags?: string[]
  sortBy?: string
  archived?: boolean
}

interface UseLinksReturn {
  links: CosmicLink[]
  loading: boolean
  error: string | null
  pagination: PaginationData | null
  refetch: () => void
  addLink: (linkData: { url: string; title: string; notes: string; tags: string }) => Promise<{ success: boolean; link?: CosmicLink; error?: string }>
  updateLink: (linkId: string, updates: Partial<CosmicLink>) => Promise<{ success: boolean; link?: CosmicLink; error?: string }>
  deleteLink: (linkId: string) => Promise<{ success: boolean; error?: string }>
  bulkDeleteLinks: (linkIds: string[]) => Promise<{ success: boolean; error?: string }>
  bulkArchiveLinks: (linkIds: string[]) => Promise<{ success: boolean; error?: string }>
}

export function useLinks(options: UseLinkOptions = {}): UseLinksReturn {
  const [links, setLinks] = useState<CosmicLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData | null>(null)

  const fetchLinks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams()
      
      if (options.page) searchParams.set('page', options.page.toString())
      if (options.limit) searchParams.set('limit', options.limit.toString())
      if (options.search) searchParams.set('search', options.search)
      if (options.tags && options.tags.length > 0) {
        searchParams.set('tags', options.tags.join(','))
      }
      if (options.sortBy) searchParams.set('sortBy', options.sortBy)
      if (options.archived !== undefined) searchParams.set('archived', options.archived.toString())

      const response = await fetch(`/api/links?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch links')
      }
      
      const data = await response.json()
      setLinks(data.links || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [
    options.page,
    options.limit,
    options.search,
    options.tags,
    options.sortBy,
    options.archived
  ])

  const refetch = () => {
    fetchLinks()
  }

  const addLink = async (linkData: {
    url: string
    title: string
    notes: string
    tags: string
  }) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      })

      if (response.ok) {
        const newLink = await response.json()
        setLinks(prev => [newLink, ...prev])
        return { success: true, link: newLink }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const updateLink = async (linkId: string, updates: Partial<CosmicLink>) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedLink = await response.json()
        setLinks(prev => prev.map(link => 
          link.id === linkId ? updatedLink : link
        ))
        return { success: true, link: updatedLink }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const deleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLinks(prev => prev.filter(link => link.id !== linkId))
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const bulkDeleteLinks = async (linkIds: string[]) => {
    try {
      const response = await fetch('/api/links/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkIds }),
      })

      if (response.ok) {
        setLinks(prev => prev.filter(link => !linkIds.includes(link.id)))
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const bulkArchiveLinks = async (linkIds: string[]) => {
    try {
      const response = await fetch('/api/links/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkIds, updates: { archived: true } }),
      })

      if (response.ok) {
        setLinks(prev => prev.map(link => 
          linkIds.includes(link.id) 
            ? { ...link, metadata: { ...link.metadata, archived: true } }
            : link
        ))
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  return {
    links,
    loading,
    error,
    pagination,
    refetch,
    addLink,
    updateLink,
    deleteLink,
    bulkDeleteLinks,
    bulkArchiveLinks
  }
}