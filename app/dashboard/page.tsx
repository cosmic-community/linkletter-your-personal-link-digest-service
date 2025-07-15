'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { BookmarkForm } from '@/components/BookmarkForm'
import { LinkList } from '@/components/LinkList'
import { CosmicLink } from '@/lib/types'

export default function DashboardPage() {
  const [links, setLinks] = useState<CosmicLink[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
    } catch (error) {
      console.error('Error parsing token:', error)
      router.push('/login')
      return
    }

    fetchLinks()
  }, [router])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = async (linkData: {
    url: string
    title: string
    notes: string
    tags: string
  }) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...linkData,
          userId: user.userId,
        }),
      })

      if (response.ok) {
        const newLink = await response.json()
        setLinks(prev => [newLink, ...prev])
      }
    } catch (error) {
      console.error('Error adding link:', error)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLinks(prev => prev.filter(link => link.id !== linkId))
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
          <p className="text-gray-600">
            Manage your bookmarks and get weekly digests
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BookmarkForm onSubmit={handleAddLink} />
          </div>

          <div className="lg:col-span-2">
            <LinkList
              links={links}
              onDelete={handleDeleteLink}
            />
          </div>
        </div>
      </div>
    </div>
  )
}