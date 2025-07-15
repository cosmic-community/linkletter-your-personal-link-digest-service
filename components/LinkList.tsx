'use client'

import { useState } from 'react'
import { LinkCard } from './LinkCard'
import { Pagination } from './Pagination'
import { LoadingSpinner } from './LoadingSpinner'
import { CosmicLink, PaginationData } from '@/lib/types'

interface LinkListProps {
  links: CosmicLink[]
  onDelete?: (linkId: string) => void
  onEdit?: (linkId: string, data: Partial<CosmicLink>) => void
  onSelect?: (linkId: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  selectedIds?: string[]
  pagination?: PaginationData
  onPageChange?: (page: number) => void
  loading?: boolean
}

export function LinkList({ 
  links, 
  onDelete, 
  onEdit, 
  onSelect, 
  onSelectAll, 
  selectedIds = [], 
  pagination,
  onPageChange,
  loading = false
}: LinkListProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked)
    }
  }

  const handleCardSelect = (linkId: string, selected: boolean) => {
    if (onSelect) {
      onSelect(linkId, selected)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No links found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria, or add your first bookmark!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with bulk selection */}
      {onSelect && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIds.length === links.length && links.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                Select all {links.length} links
              </span>
            </div>
            {selectedIds.length > 0 && (
              <span className="text-sm text-blue-600 font-medium">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        </div>
      )}

      {/* Links Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {links.map(link => (
          <LinkCard
            key={link.id}
            link={link}
            onDelete={onDelete}
            onEdit={onEdit}
            onSelect={onSelect ? (selected) => handleCardSelect(link.id, selected) : undefined}
            selected={selectedIds.includes(link.id)}
            expanded={expandedCard === link.id}
            onToggleExpanded={() => setExpandedCard(
              expandedCard === link.id ? null : link.id
            )}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}