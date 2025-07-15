'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      try {
        const tokenParts = token.split('.')
        if (tokenParts.length === 3 && tokenParts[1]) {
          const payload = JSON.parse(atob(tokenParts[1]))
          
          // Check if token is expired
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            localStorage.removeItem('auth-token')
            setUser(null)
          } else {
            setUser({
              id: payload.userId,
              email: payload.email,
              subscriptionTier: payload.subscriptionTier
            })
          }
        }
      } catch (error) {
        console.error('Error parsing token:', error)
        localStorage.removeItem('auth-token')
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth-token', data.token)
        setUser({
          id: data.user.id,
          email: data.user.metadata.email,
          subscriptionTier: data.user.metadata.subscription_tier?.value || 'Free'
        })
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth-token')
      setUser(null)
      router.push('/')
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth-token', data.token)
        setUser({
          id: data.user.id,
          email: data.user.metadata.email,
          subscriptionTier: data.user.metadata.subscription_tier?.value || 'Free'
        })
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    register
  }
}