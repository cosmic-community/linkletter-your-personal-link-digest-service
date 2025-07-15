'use client'

import { useState, useEffect, useRef } from 'react'

interface TagAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TagAutocomplete({
  value,
  onChange,
  placeholder = "Add tags...",
  disabled = false,
  className = ""
}: TagAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Mock popular tags - in a real app, this would come from an API
  const popularTags = [
    'javascript', 'react', 'typescript', 'nodejs', 'css', 'html',
    'web development', 'programming', 'tutorial', 'documentation',
    'tools', 'productivity', 'design', 'ui/ux', 'api', 'database',
    'mobile', 'frontend', 'backend', 'fullstack', 'devops', 'testing'
  ]

  useEffect(() => {
    const currentInput = value.split(',').pop()?.trim() || ''
    
    if (currentInput.length > 0) {
      const filteredSuggestions = popularTags.filter(tag =>
        tag.toLowerCase().includes(currentInput.toLowerCase()) &&
        !value.toLowerCase().includes(tag.toLowerCase())
      )
      setSuggestions(filteredSuggestions.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setActiveSuggestion(-1)
  }

  const handleSuggestionClick = (suggestion: string) => {
    const tags = value.split(',').map(tag => tag.trim())
    tags.pop() // Remove the incomplete tag
    tags.push(suggestion)
    onChange(tags.join(', ') + ', ')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault()
      const selectedSuggestion = suggestions[activeSuggestion]
      if (selectedSuggestion) {
        handleSuggestionClick(selectedSuggestion)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => value && setShowSuggestions(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                index === activeSuggestion ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}