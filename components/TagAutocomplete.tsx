'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface TagAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function TagAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Add tags...",
  className = "" 
}: TagAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedValue = useDebounce(value, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get the current tag being typed (after the last comma)
  const getCurrentTag = (input: string): string => {
    const tags = input.split(',').map(tag => tag.trim())
    return tags[tags.length - 1] || ''
  }

  // Get all complete tags (before the last comma)
  const getCompleteTags = (input: string): string[] => {
    const tags = input.split(',').map(tag => tag.trim()).filter(Boolean)
    return tags.slice(0, -1)
  }

  // Fetch tag suggestions from API
  useEffect(() => {
    const fetchSuggestions = async () => {
      const currentTag = getCurrentTag(debouncedValue)
      
      if (!currentTag || currentTag.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/links/search?tags=${encodeURIComponent(currentTag)}`)
        if (response.ok) {
          const data = await response.json()
          // Extract unique tags from the response
          const allTags = data.tags || []
          const completeTags = getCompleteTags(value)
          
          // Filter out already selected tags and show matching suggestions
          const filteredTags = allTags.filter((tag: string) => 
            !completeTags.includes(tag) && 
            tag.toLowerCase().includes(currentTag.toLowerCase())
          )
          
          setSuggestions(filteredTags.slice(0, 5)) // Limit to 5 suggestions
          setIsOpen(filteredTags.length > 0)
        }
      } catch (error) {
        console.error('Error fetching tag suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedValue, value])

  // Handle tag selection
  const handleTagSelect = (selectedTag: string) => {
    const completeTags = getCompleteTags(value)
    const newValue = completeTags.length > 0 
      ? `${completeTags.join(', ')}, ${selectedTag}, `
      : `${selectedTag}, `
    
    onChange(newValue)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault()
      setIsOpen(true)
      // Focus first suggestion
      const firstSuggestion = dropdownRef.current?.querySelector('[data-suggestion-index="0"]') as HTMLElement
      firstSuggestion?.focus()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Handle suggestion key navigation
  const handleSuggestionKeyDown = (e: React.KeyboardEvent, index: number, tag: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTagSelect(tag)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (index === 0) {
        inputRef.current?.focus()
      } else {
        const prevSuggestion = dropdownRef.current?.querySelector(`[data-suggestion-index="${index - 1}"]`) as HTMLElement
        prevSuggestion?.focus()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (index < suggestions.length - 1) {
        const nextSuggestion = dropdownRef.current?.querySelector(`[data-suggestion-index="${index + 1}"]`) as HTMLElement
        nextSuggestion?.focus()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.focus()
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      />
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Loading suggestions...
            </div>
          )}
          
          {!loading && suggestions.length > 0 && (
            <div role="listbox" aria-label="Tag suggestions">
              {suggestions.map((tag, index) => (
                <button
                  key={tag}
                  data-suggestion-index={index}
                  onClick={() => handleTagSelect(tag)}
                  onKeyDown={(e) => handleSuggestionKeyDown(e, index, tag)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  role="option"
                  aria-selected={false}
                >
                  <span className="font-medium">{tag}</span>
                </button>
              ))}
            </div>
          )}
          
          {!loading && suggestions.length === 0 && getCurrentTag(value || '').length >= 2 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No matching tags found
            </div>
          )}
        </div>
      )}
    </div>
  )
}