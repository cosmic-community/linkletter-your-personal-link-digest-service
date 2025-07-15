export interface CosmicObject {
  id: string
  title: string
  slug: string
  content: string
  bucket: string
  created_at: string
  modified_at: string
  status: string
  thumbnail?: string
  published_at: string
  modified_by: string
  created_by: string
  type: string
}

export interface CosmicUser extends CosmicObject {
  metadata: {
    email: string
    password_hash: string
    first_name: string
    last_name: string
    subscription_tier: {
      key: string
      value: string
    } | string
    stripe_customer_id: string | null
    weekly_link_count: number
    email_verified: boolean
    account_created: string
    last_login: string
    preferences: {
      email_notifications: boolean
      digest_time: string
      timezone: string
      pocket_integration: boolean
    }
  }
}

export interface CosmicLink extends CosmicObject {
  metadata: {
    url: string
    title: string
    notes: string
    tags: string
    user: CosmicUser | string
    date_saved: string
    week_number: number
    year: number
    archived: boolean
    click_count: number
  }
}

export interface CosmicWeeklyDigest extends CosmicObject {
  metadata: {
    user: CosmicUser
    week_number: number
    year: number
    links: CosmicLink[]
    email_sent: boolean
    send_date: string
    email_service_response: {
      id: string
      message: string
      status: string
    }
    email_opened: boolean
    links_clicked: number
  }
}

export interface CosmicAppSettings extends CosmicObject {
  metadata: {
    site_name: string
    free_tier_link_limit: number
    stripe_publishable_key: string
    stripe_secret_key: string
    mailgun_api_key: string
    mailgun_domain: string
    digest_send_day: {
      key: string
      value: string
    }
    features_enabled: {
      pocket_integration: boolean
      notion_integration: boolean
      email_tracking: boolean
      analytics: boolean
      admin_dashboard: boolean
      debug_mode: boolean
      user_registration: boolean
      email_verification: boolean
    }
    email_templates: {
      weekly_digest: {
        subject: string
        html: string
      }
      welcome: {
        subject: string
        html: string
      }
      signup_error: {
        subject: string
        html: string
      }
    }
  }
}

export interface TokenPayload {
  userId: string
  email: string
  subscriptionTier: string
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  subscriptionTier: string
  firstName?: string
  lastName?: string
  metadata?: {
    first_name?: string
    last_name?: string
    email?: string
    subscription_tier?: {
      key: string
      value: string
    }
  }
  title?: string
}

export interface LinkFormData {
  url: string
  title: string
  notes: string
  tags: string
}

export interface UserFormData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface FilterOptions {
  searchTerm: string
  selectedTag: string
  sortBy: 'date' | 'title' | 'clicks'
  archived?: boolean
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface BulkActionData {
  selectedIds: string[]
  action: 'delete' | 'archive' | 'unarchive' | 'tag'
  value?: string
}

export interface ImportData {
  source: 'pocket' | 'browser' | 'csv'
  data: any[]
}

export interface AnalyticsData {
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

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface MetadataFetchResult {
  title: string
  description: string
  image?: string
  url: string
  favicon?: string
  siteName?: string
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface DigestEmailData {
  user: CosmicUser
  links: CosmicLink[]
  weekNumber: number
  year: number
  unsubscribeUrl: string
}

export interface StripeSession {
  id: string
  url: string
  customer: string
  subscription?: string
}

export interface PaymentData {
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
}

export interface WebhookEvent {
  id: string
  type: string
  data: any
  created: number
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  services: {
    cosmic: boolean
    stripe: boolean
    mailgun: boolean
    database: boolean
  }
  timestamp: number
}

export interface TagSuggestion {
  tag: string
  count: number
}

export interface LinkStats {
  totalClicks: number
  dailyClicks: number[]
  referrers: Record<string, number>
  countries: Record<string, number>
}

export interface UserPreferences {
  emailNotifications: boolean
  digestTime: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  pocketIntegration: boolean
  notionIntegration: boolean
}

export interface SearchResult {
  links: CosmicLink[]
  total: number
  facets: {
    tags: TagSuggestion[]
    users: { id: string; name: string; count: number }[]
  }
}

export interface LinkPreview {
  url: string
  title: string
  description: string
  image?: string
  favicon?: string
  siteName?: string
}

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: number
  read: boolean
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface BackupData {
  timestamp: number
  version: string
  data: {
    users: CosmicUser[]
    links: CosmicLink[]
    settings: CosmicAppSettings
  }
}

export interface FeatureFlag {
  key: string
  enabled: boolean
  description: string
  rolloutPercentage: number
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalLinks: number
  linksThisWeek: number
  digestsSent: number
  revenue: number
  conversionRate: number
  churnRate: number
}

export interface ErrorLog {
  id: string
  message: string
  stack: string
  timestamp: number
  userId?: string
  url: string
  userAgent: string
  resolved: boolean
}

export interface PerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  uptime: number
  memoryUsage: number
  cpuUsage: number
}