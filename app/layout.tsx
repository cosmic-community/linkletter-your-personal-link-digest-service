import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinkLetter - Your Personal Link Digest Service',
  description: 'Save and organize your links with weekly email digests',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  )
}