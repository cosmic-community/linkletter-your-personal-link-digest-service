'use client'

import { useEffect, useState } from 'react'
import { AdminDashboard } from '@/components/AdminDashboard'
import { UserStats } from '@/components/UserStats'

interface Analytics {
  users: {
    total: number
    free: number
    paid: number
    verified: number
  }
  links: {
    total: number
    thisWeek: number
    totalClicks: number
  }
  digests: {
    total: number
    sent: number
    opened: number
  }
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return <div className="text-center">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {analytics && (
        <>
          <UserStats analytics={analytics} />
          <AdminDashboard analytics={analytics} />
        </>
      )}
    </div>
  )
}