interface UserStatsProps {
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

export function UserStats({ analytics }: UserStatsProps) {
  const { users, links, digests } = analytics

  const stats = [
    {
      label: 'Total Users',
      value: users.total,
      color: 'bg-blue-600',
      icon: '👥'
    },
    {
      label: 'Free Users',
      value: users.free,
      color: 'bg-green-600',
      icon: '🆓'
    },
    {
      label: 'Paid Users',
      value: users.paid,
      color: 'bg-purple-600',
      icon: '💎'
    },
    {
      label: 'Verified Users',
      value: users.verified,
      color: 'bg-yellow-600',
      icon: '✅'
    },
    {
      label: 'Total Links',
      value: links.total,
      color: 'bg-indigo-600',
      icon: '🔗'
    },
    {
      label: 'Links This Week',
      value: links.thisWeek,
      color: 'bg-red-600',
      icon: '📅'
    },
    {
      label: 'Total Clicks',
      value: links.totalClicks,
      color: 'bg-orange-600',
      icon: '👆'
    },
    {
      label: 'Digests Sent',
      value: digests.sent,
      color: 'bg-pink-600',
      icon: '📧'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}