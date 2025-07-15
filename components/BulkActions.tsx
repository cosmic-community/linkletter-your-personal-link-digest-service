'use client'

import { useState } from 'react'

interface BulkActionsProps {
  selectedCount: number
  onAction: (action: string, value?: string) => void
  onCancel: () => void
}

export function BulkActions({ selectedCount, onAction, onCancel }: BulkActionsProps) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagValue, setTagValue] = useState('')

  const handleTagAction = () => {
    if (tagValue.trim()) {
      onAction('tag', tagValue.trim())
      setTagValue('')
      setShowTagInput(false)
    }
  }

  const handleAction = (action: string) => {
    if (action === 'tag') {
      setShowTagInput(true)
    } else {
      onAction(action)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-blue-800 font-medium">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction('archive')}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Archive
            </button>
            
            <button
              onClick={() => handleAction('unarchive')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Unarchive
            </button>
            
            <button
              onClick={() => handleAction('tag')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Add Tags
            </button>
            
            <button
              onClick={() => handleAction('delete')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Cancel
        </button>
      </div>
      
      {showTagInput && (
        <div className="mt-3 flex items-center space-x-2">
          <input
            type="text"
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
            placeholder="Enter tags separated by commas..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTagAction()
              } else if (e.key === 'Escape') {
                setShowTagInput(false)
                setTagValue('')
              }
            }}
          />
          <button
            onClick={handleTagAction}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowTagInput(false)
              setTagValue('')
            }}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}