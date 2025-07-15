'use client'

import { useState } from 'react'
import { CosmicLink } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface LinkCardProps {
  link: CosmicLink
  onDelete?: (linkId: string) => void
  onEdit?: (linkId: string, data: Partial<CosmicLink>) => void
  onSelect?: (selected: boolean) => void
  selected?: boolean
  expanded?: boolean
  onToggleExpanded?: () => void
}

export function LinkCard({ 
  link, 
  onDelete, 
  onEdit, 
  onSelect, 
  selected = false, 
  expanded = false,
  onToggleExpanded 
}: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: link.metadata?.title || link.title,
    notes: link.metadata?.notes || '',
    tags: link.metadata?.tags || ''
  })

  // Fix: Add proper type checking and null handling
  const user = typeof link.metadata?.user === 'object' ? link.metadata.user : null
  const dateSaved = link.metadata?.date_saved ? new Date(link.metadata.date_saved) : new Date()
  const timeAgo = formatDistanceToNow(dateSaved, { addSuffix: true })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(link.id, {
        title: editData.title,
        metadata: {
          ...link.metadata,
          title: editData.title,
          notes: editData.notes,
          tags: editData.tags
        }
      })
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditData({
      title: link.metadata?.title || link.title,
      notes: link.metadata?.notes || '',
      tags: link.metadata?.tags || ''
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this link?')) {
      onDelete(link.id)
    }
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(e.target.checked)
    }
  }

  const handleLinkClick = () => {
    if (link.metadata?.url) {
      window.open(link.metadata.url, '_blank', 'noopener noreferrer')
      
      // Track click (optional)
      fetch(`/api/links/${link.id}/click`, {
        method: 'POST'
      }).catch(error => console.error('Error tracking click:', error))
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={handleSelect}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            )}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-lg font-semibold"
                />
              ) : (
                <h3 
                  className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                  onClick={handleLinkClick}
                >
                  {link.metadata?.title || link.title}
                </h3>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {timeAgo}
            </span>
            <div className="flex space-x-1">
              {onEdit && (
                <button
                  onClick={isEditing ? handleSaveEdit : handleEdit}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              )}
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
        
        {link.metadata?.url && (
          <div className="mb-3">
            <a
              href={link.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm break-all"
              onClick={(e) => {
                e.stopPropagation()
                handleLinkClick()
              }}
            >
              {link.metadata.url}
            </a>
          </div>
        )}
        
        {(link.metadata?.notes || isEditing) && (
          <div className="mb-3">
            {isEditing ? (
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                rows={3}
                placeholder="Add notes..."
              />
            ) : (
              <p className={`text-gray-600 text-sm ${
                expanded ? '' : 'line-clamp-3'
              }`}>
                {link.metadata.notes}
              </p>
            )}
            {link.metadata?.notes && link.metadata.notes.length > 150 && onToggleExpanded && (
              <button
                onClick={onToggleExpanded}
                className="text-blue-600 hover:text-blue-800 text-sm mt-1"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {(link.metadata?.tags || isEditing) && (
              <div className="flex flex-wrap gap-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.tags}
                    onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="Add tags..."
                  />
                ) : (
                  link.metadata.tags?.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {tag.trim()}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {user && user.metadata && (
              <span>by {user.metadata.first_name || user.title}</span>
            )}
            {typeof link.metadata?.click_count === 'number' && (
              <span>• {link.metadata.click_count} clicks</span>
            )}
            {link.metadata?.archived && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                Archived
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}