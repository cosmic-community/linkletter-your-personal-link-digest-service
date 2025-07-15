import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            LinkLetter
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your Personal Link Digest Service. Save links throughout the week 
            and get a beautiful email digest every Friday.
          </p>
          <Link 
            href="/register" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LinkLetter?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📎</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Link Saving</h3>
              <p className="text-gray-600">
                Quickly save links with notes and tags. No more lost bookmarks in browser folders.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Weekly Digests</h3>
              <p className="text-gray-600">
                Get a beautiful email every Friday with all your saved links organized and ready to read.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Integrations</h3>
              <p className="text-gray-600">
                Connect with Pocket, Notion, and other tools. Pro users get unlimited links and features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Simple, Transparent Pricing</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">$0</div>
              <ul className="text-left space-y-2 mb-6">
                <li>✅ 5 links per week</li>
                <li>✅ Weekly email digest</li>
                <li>✅ Basic dashboard</li>
              </ul>
              <Link href="/register" className="btn btn-secondary w-full">
                Start Free
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 border-2 border-blue-600">
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">$9</div>
              <ul className="text-left space-y-2 mb-6">
                <li>✅ Unlimited links</li>
                <li>✅ Pocket integration</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Priority support</li>
              </ul>
              <Link href="/pricing" className="btn btn-primary w-full">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}