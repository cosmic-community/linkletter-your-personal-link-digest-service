'use client'

import { useState, useEffect } from 'react'
import { validateUrl } from '@/lib/validations'
import TagAutocomplete from './TagAutocomplete'
import { LoadingSpinner } from './LoadingSpinner'
import { MetadataFetchResult } from '@/lib/metadata'

interface BookmarkFormProps {
  onSubmit: (data: {
    url: string
    title: string
    notes: string
    tags: string
  }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function BookmarkForm({ onSubmit, onCancel, loading = false }: BookmarkFormProps) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    notes: '',
    tags: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [metadataFetched, setMetadataFetched] = useState(false)

  // Auto-fetch metadata when URL changes
  useEffect(() => {
    const fetchMetadata = async () => {
      if (formData.url && validateUrl(formData.url) && !metadataFetched) {
        setFetchingMetadata(true)
        try {
          const response = await fetch(`/api/metadata?url=${encodeURIComponent(formData.url)}`)
          if (response.ok) {
            const metadata: MetadataFetchResult = await response.json()
            setFormData(prev => ({
              ...prev,
              title: prev.title || metadata.title,
              notes: prev.notes || metadata.description
            }))
            setMetadataFetched(true)
          }
        } catch (error) {
          console.error('Error fetching metadata:', error)
        } finally {
          setFetchingMetadata(false)
        }
      }
    }

    const timeoutId = setTimeout(fetchMetadata, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.url, metadataFetched])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.url) {
      newErrors.url = 'URL is required'
    } else if (!validateUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL'
    }
    
    if (!formData.title) {
      newErrors.title = 'Title is required'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(formData)
        // Reset form on success
        setFormData({
          url: '',
          title: '',
          notes: '',
          tags: ''
        })
        setMetadataFetched(false)
      } catch (error) {
        console.error('Error submitting bookmark:', error)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Reset metadata fetched when URL changes
    if (name === 'url') {
      setMetadataFetched(false)
    }
  }

  const handleTagsChange = (tags: string) => {
    setFormData(prev => ({
      ...prev,
      tags
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Bookmark</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fetchingMetadata && (
                  <div className="absolute right-3 top-2.5">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a title for this link"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any notes about this link..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Optional)
              </label>
              <TagAutocomplete
                value={formData.tags}
                onChange={handleTagsChange}
                placeholder="Add tags separated by commas"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetchingMetadata}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Bookmark'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}