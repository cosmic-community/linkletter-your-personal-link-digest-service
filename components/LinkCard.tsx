import { CosmicLink } from '@/lib/types'

interface LinkCardProps {
  link: CosmicLink
}

export function LinkCard({ link }: LinkCardProps) {
  // Fix: Add proper type checking and null handling
  const user = typeof link.metadata?.user === 'object' ? link.metadata.user : null
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {link.metadata?.title || link.title}
        </h3>
        <span className="text-sm text-gray-500 ml-2">
          {link.metadata?.date_saved ? new Date(link.metadata.date_saved).toLocaleDateString() : ''}
        </span>
      </div>
      
      {link.metadata?.url && (
        <a
          href={link.metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm break-all mb-3 block"
        >
          {link.metadata.url}
        </a>
      )}
      
      {link.metadata?.notes && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {link.metadata.notes}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {link.metadata?.tags && (
            <div className="flex flex-wrap gap-1">
              {link.metadata.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {user && user.metadata && (
            <span>by {user.metadata.first_name || user.title}</span>
          )}
          {typeof link.metadata?.click_count === 'number' && (
            <span>• {link.metadata.click_count} clicks</span>
          )}
        </div>
      </div>
    </div>
  )
}