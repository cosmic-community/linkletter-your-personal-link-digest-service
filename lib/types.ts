export interface CosmicUser {
  id: string
  slug: string
  title: string
  metadata: {
    email: string
    password_hash: string
    first_name?: string
    last_name?: string
    subscription_tier: {
      key: string
      value: string
    }
    stripe_customer_id?: string
    weekly_link_count?: number
    email_verified?: boolean
    account_created?: string
    last_login?: string
    preferences?: {
      email_notifications?: boolean
      digest_time?: string
      timezone?: string
      pocket_integration?: boolean
    }
  }
}

export interface CosmicLink {
  id: string
  slug: string
  title: string
  metadata: {
    url: string
    title?: string
    notes?: string
    tags?: string
    user: CosmicUser | string
    date_saved: string
    week_number: number
    year: number
    archived?: boolean
    click_count?: number
  }
}

export interface CosmicWeeklyDigest {
  id: string
  slug: string
  title: string
  metadata: {
    user: CosmicUser
    week_number: number
    year: number
    links?: CosmicLink[]
    email_sent?: boolean
    send_date?: string
    email_service_response?: {
      id?: string
      message?: string
      status?: string
    }
    email_opened?: boolean
    links_clicked?: number
  }
}

export interface CosmicAppSettings {
  id: string
  slug: string
  title: string
  metadata: {
    site_name: string
    free_tier_link_limit: number
    stripe_publishable_key?: string
    stripe_secret_key?: string
    mailgun_api_key?: string
    mailgun_domain?: string
    digest_send_day: {
      key: string
      value: string
    }
    features_enabled?: {
      pocket_integration?: boolean
      notion_integration?: boolean
      email_tracking?: boolean
      analytics?: boolean
      admin_dashboard?: boolean
    }
    email_templates?: {
      weekly_digest?: {
        subject: string
        html: string
      }
      welcome?: {
        subject: string
        html: string
      }
    }
  }
}