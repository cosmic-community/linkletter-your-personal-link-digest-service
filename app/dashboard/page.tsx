import { getLinks, getUsers } from '@/lib/cosmic'
import { LinkCard } from '@/components/LinkCard'

export default async function DashboardPage() {
  const [links, users] = await Promise.all([
    getLinks(),
    getUsers()
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Manage your links and users</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{links.length}</div>
              <div className="text-sm text-gray-500">Total Links</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{users.length}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full btn btn-primary">Add New Link</button>
            <button className="w-full btn btn-secondary">Send Digest</button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Links</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.slice(0, 6).map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </div>
    </div>
  )
}