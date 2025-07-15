'use client'

import { useState } from 'react'
import { LinkCard } from './LinkCard'
import { CosmicLink } from '@/lib/types'

interface LinkListProps {
  links: CosmicLink[]
  onDelete?: (linkId: string) => void
  onEdit?: (linkId: string, data: Partial<CosmicLink>) => void
}

export function LinkList({ links, onDelete, onEdit }: LinkListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'clicks'>('date')

  // Get all unique tags
  const allTags = Array.from(
    new Set(
      links
        .filter(link => link.metadata.tags)
        .flatMap(link => link.metadata.tags?.split(',').map(tag => tag.trim()) || [])
    )
  )

  // Filter and sort links
  const filteredLinks = links
    .filter(link => {
      const matchesSearch = !searchTerm || 
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.metadata.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.metadata.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTag = !selectedTag || 
        link.metadata.tags?.toLowerCase().includes(selectedTag.toLowerCase())
      
      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'clicks':
          return (b.metadata.click_count || 0) - (a.metadata.click_count || 0)
        case 'date':
        default:
          return new Date(b.metadata.date_saved).getTime() - new Date(a.metadata.date_saved).getTime()
      }
    })

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔗</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
        <p className="text-gray-500">Add your first bookmark to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search links..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Tag
            </label>
            <select
              id="tag"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'clicks')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date Added</option>
              <option value="title">Title</option>
              <option value="clicks">Most Clicked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredLinks.length} of {links.length} links
      </div>

      {/* Links Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLinks.map(link => (
          <LinkCard
            key={link.id}
            link={link}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}