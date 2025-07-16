'use client'

import { useState, useEffect } from 'react'
import { CosmicUser } from '@/lib/types'

interface AdminDashboardProps {
  analytics: {
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
}

export function AdminDashboard({ analytics }: AdminDashboardProps) {
  const [users, setUsers] = useState<CosmicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingDigests, setSendingDigests] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendDigests = async () => {
    setSendingDigests(true)
    try {
      const response = await fetch('/api/digest/send', {
        method: 'POST'
      })
      if (response.ok) {
        const result = await response.json()
        alert(`Sent ${result.digests?.length || 0} digests successfully!`)
      }
    } catch (error) {
      console.error('Error sending digests:', error)
      alert('Error sending digests. Please try again.')
    } finally {
      setSendingDigests(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={sendDigests}
            disabled={sendingDigests}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {sendingDigests ? 'Sending...' : 'Send Weekly Digests'}
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Export User Data
          </button>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Links This Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => {
                  const subscriptionTier = user.metadata.subscription_tier
                  const tierValue = typeof subscriptionTier === 'string' ? subscriptionTier : subscriptionTier?.value || 'Free'
                  
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                            {user.metadata.first_name?.[0] || user.metadata.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.metadata.first_name || ''} {user.metadata.last_name || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined {user.metadata.account_created ? new Date(user.metadata.account_created).toLocaleDateString() : 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.metadata.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tierValue === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tierValue}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.metadata.weekly_link_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.metadata.email_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.metadata.email_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}