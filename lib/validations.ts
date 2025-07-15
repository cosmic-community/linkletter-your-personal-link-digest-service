import { ValidationResult } from './types'

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRegistrationData(data: {
  email: string
  password: string
  firstName?: string
  lastName?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (!data.email) {
    errors.push('Email is required')
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format')
  }
  
  if (!data.password) {
    errors.push('Password is required')
  } else {
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateLinkData(data: {
  url: string
  title: string
  notes?: string
  tags?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (!data.url) {
    errors.push('URL is required')
  } else if (!validateUrl(data.url)) {
    errors.push('Invalid URL format')
  }
  
  if (!data.title) {
    errors.push('Title is required')
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }
  
  if (data.notes && data.notes.length > 1000) {
    errors.push('Notes must be less than 1000 characters')
  }
  
  if (data.tags && data.tags.length > 200) {
    errors.push('Tags must be less than 200 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function validateTagString(tags: string): ValidationResult {
  const errors: string[] = []
  
  if (tags.length > 200) {
    errors.push('Tags must be less than 200 characters')
  }
  
  const tagArray = tags.split(',').map(tag => tag.trim())
  
  if (tagArray.length > 10) {
    errors.push('Maximum 10 tags allowed')
  }
  
  const invalidTags = tagArray.filter(tag => tag.length > 30)
  if (invalidTags.length > 0) {
    errors.push('Each tag must be less than 30 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}