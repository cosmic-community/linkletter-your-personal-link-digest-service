'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  title: string
  metadata: {
    email: string
    subscription_tier: {
      value: string
    }
  }
}

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      try {
        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          // This is a simplified user object from token
          // In production, you'd want to fetch full user data
          setUser({
            id: payload.userId,
            title: payload.email,
            metadata: {
              email: payload.email,
              subscription_tier: {
                value: payload.subscriptionTier
              }
            }
          })
        }
      } catch (error) {
        console.error('Error parsing token:', error)
        localStorage.removeItem('auth-token')
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('auth-token')
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return null
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            LinkLetter
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/settings" className="text-gray-700 hover:text-blue-600">
                  Settings
                </Link>
                {user.metadata.subscription_tier.value === 'Free' && (
                  <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
                    Upgrade
                  </Link>
                )}
                {user.metadata.subscription_tier.value === 'Admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {user.metadata.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}