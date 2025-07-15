'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { BookmarkForm } from '@/components/BookmarkForm'
import { LinkList } from '@/components/LinkList'
import { SearchBar } from '@/components/SearchBar'
import { FilterDropdown } from '@/components/FilterDropdown'
import { BulkActions } from '@/components/BulkActions'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CosmicLink, FilterOptions, PaginationData } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useLinks } from '@/hooks/useLinks'
import { useDebounce } from '@/hooks/useDebounce'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    selectedTag: '',
    sortBy: 'date',
    archived: false
  })
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const debouncedSearchTerm = useDebounce(filterOptions.searchTerm, 300)
  
  const { 
    links, 
    loading: linksLoading, 
    error,
    pagination,
    refetch 
  } = useLinks({
    page: currentPage,
    search: debouncedSearchTerm,
    tag: filterOptions.selectedTag,
    sortBy: filterOptions.sortBy,
    archived: filterOptions.archived
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleLinkSelect = (linkId: string, selected: boolean) => {
    setSelectedLinks(prev => 
      selected 
        ? [...prev, linkId]
        : prev.filter(id => id !== linkId)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedLinks(selected ? links.map(link => link.id) : [])
  }

  const handleBulkAction = async (action: string, value?: string) => {
    if (selectedLinks.length === 0) return

    try {
      const response = await fetch('/api/links/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIds: selectedLinks,
          action,
          value
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Bulk action result:', result)
        
        // Clear selection and refresh links
        setSelectedLinks([])
        setShowBulkActions(false)
        refetch()
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const handleAddLink = async (linkData: {
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
        refetch()
      }
    } catch (error) {
      console.error('Error adding link:', error)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        refetch()
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  // Show loading state
  if (authLoading || linksLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading dashboard: {error}
          </div>
        </div>
      </div>
    )
  }

  // Get all unique tags for filter dropdown
  const allTags = Array.from(
    new Set(
      links
        .filter(link => link.metadata.tags)
        .flatMap(link => link.metadata.tags?.split(',').map(tag => tag.trim()) || [])
    )
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
            <p className="text-gray-600">
              Manage your bookmarks and get weekly digests
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar with form */}
            <div className="lg:col-span-1 space-y-6">
              <BookmarkForm onSubmit={handleAddLink} />
              
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Links</span>
                    <span className="font-semibold">{pagination?.totalItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold">
                      {links.filter(link => {
                        const linkDate = new Date(link.metadata.date_saved)
                        const weekStart = new Date()
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                        return linkDate >= weekStart
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Clicks</span>
                    <span className="font-semibold">
                      {links.reduce((sum, link) => sum + (link.metadata.click_count || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filter Controls */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <SearchBar
                      value={filterOptions.searchTerm}
                      onChange={(value) => handleFilterChange({ searchTerm: value })}
                      placeholder="Search links..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <FilterDropdown
                      options={[
                        { value: '', label: 'All Tags' },
                        ...allTags.map(tag => ({ value: tag, label: tag }))
                      ]}
                      value={filterOptions.selectedTag}
                      onChange={(value) => handleFilterChange({ selectedTag: value })}
                      placeholder="Filter by tag"
                    />
                    <FilterDropdown
                      options={[
                        { value: 'date', label: 'Date Added' },
                        { value: 'title', label: 'Title' },
                        { value: 'clicks', label: 'Most Clicked' }
                      ]}
                      value={filterOptions.sortBy}
                      onChange={(value) => handleFilterChange({ sortBy: value as 'date' | 'title' | 'clicks' })}
                      placeholder="Sort by"
                    />
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedLinks.length > 0 && (
                  <BulkActions
                    selectedCount={selectedLinks.length}
                    onAction={handleBulkAction}
                    onCancel={() => {
                      setSelectedLinks([])
                      setShowBulkActions(false)
                    }}
                  />
                )}
              </div>

              {/* Links List */}
              <LinkList
                links={links}
                onDelete={handleDeleteLink}
                onSelect={handleLinkSelect}
                onSelectAll={handleSelectAll}
                selectedIds={selectedLinks}
                pagination={pagination ?? undefined}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}