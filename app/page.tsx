import { LinkCard } from '@/components/LinkCard'
import { getLinks } from '@/lib/cosmic'

export default async function HomePage() {
  const links = await getLinks()

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          LinkLetter
        </h1>
        <p className="text-xl text-gray-600">
          Your Personal Link Digest Service
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </div>
  )
}