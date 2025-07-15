'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLinks } from '@/hooks/useLinks'
import { useDebounce } from '@/hooks/useDebounce'
import { LinkList } from '@/components/LinkList'
import { SearchBar } from '@/components/SearchBar'
import { FilterDropdown } from '@/components/FilterDropdown'
import { BulkActions } from '@/components/BulkActions'
import { Pagination } from '@/components/Pagination'
import { BookmarkForm } from '@/components/BookmarkForm'
import { UserStats } from '@/components/UserStats'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Navigation } from '@/components/Navigation'

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'clicks'>('newest')
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  const [showBookmarkForm, setShowBookmarkForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const { 
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
  } = useLinks({
    search: debouncedSearchTerm,
    tags: selectedTags,
    sortBy,
    page: currentPage,
    limit: itemsPerPage
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedTags, sortBy])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (filter: { tags: string[], sortBy: 'newest' | 'oldest' | 'clicks' }) => {
    setSelectedTags(filter.tags)
    setSortBy(filter.sortBy)
  }

  const handleSelectLink = (linkId: string) => {
    setSelectedLinks(prev => 
      prev.includes(linkId) 
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLinks.length === links.length) {
      setSelectedLinks([])
    } else {
      setSelectedLinks(links.map(link => link.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedLinks.length === 0) return
    
    try {
      await bulkDeleteLinks(selectedLinks)
      setSelectedLinks([])
      await refetch()
    } catch (error) {
      console.error('Error deleting links:', error)
    }
  }

  const handleBulkArchive = async () => {
    if (selectedLinks.length === 0) return
    
    try {
      await bulkArchiveLinks(selectedLinks)
      setSelectedLinks([])
      await refetch()
    } catch (error) {
      console.error('Error archiving links:', error)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink(linkId)
      await refetch()
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const handleUpdateLink = async (linkId: string, updates: any) => {
    try {
      await updateLink(linkId, updates)
      await refetch()
    } catch (error) {
      console.error('Error updating link:', error)
    }
  }

  const handleBookmarkSubmit = async (linkData: {
    url: string
    title: string
    notes: string
    tags: string
  }) => {
    try {
      await addLink(linkData)
      setShowBookmarkForm(false)
      await refetch()
    } catch (error) {
      console.error('Error adding bookmark:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Show loading spinner while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Don't render anything if user is not authenticated (redirect is happening)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user.firstName || user.email}!
          </p>
        </div>

        {/* User Stats */}
        <div className="mb-8">
          <UserStats analytics={{
            users: { total: 0, free: 0, paid: 0, verified: 0 },
            links: { total: links.length, thisWeek: 0, totalClicks: 0 },
            digests: { total: 0, sent: 0, opened: 0 }
          }} />
        </div>

        {/* Add Bookmark Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowBookmarkForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Bookmark
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          <div className="flex-1">
            <SearchBar value={searchTerm} onChange={handleSearch} placeholder="Search your links..." />
          </div>
          <div className="flex space-x-2">
            <FilterDropdown
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'clicks', label: 'Most Clicked' }
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'clicks')}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLinks.length > 0 && (
          <div className="mb-6">
            <BulkActions
              selectedCount={selectedLinks.length}
              onAction={async (action) => {
                if (action === 'delete') {
                  await handleBulkDelete()
                } else if (action === 'archive') {
                  await handleBulkArchive()
                }
              }}
              onCancel={() => setSelectedLinks([])}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading links</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Links List */}
        {!loading && !error && (
          <>
            <LinkList
              links={links}
              onSelect={handleSelectLink}
              selectedIds={selectedLinks}
              onDelete={handleDeleteLink}
              onEdit={handleUpdateLink}
              pagination={pagination || undefined}
              onPageChange={handlePageChange}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && links.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714m0 0A9.971 9.971 0 0118 32a9.971 9.971 0 013.288.714m-7.576 0L18 24l4.712 8.714M23 32a9.971 9.971 0 00-4.712-.714" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No links found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedTags.length > 0 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first bookmark.'
              }
            </p>
            {!searchTerm && selectedTags.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowBookmarkForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add your first bookmark
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bookmark Form Modal */}
      {showBookmarkForm && (
        <BookmarkForm
          onSubmit={handleBookmarkSubmit}
          onCancel={() => setShowBookmarkForm(false)}
        />
      )}
    </div>
  )
}