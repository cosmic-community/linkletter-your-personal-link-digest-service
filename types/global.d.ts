declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COSMIC_BUCKET_SLUG: string
      COSMIC_READ_KEY: string
      COSMIC_WRITE_KEY: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      STRIPE_SECRET_KEY: string
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
      STRIPE_WEBHOOK_SECRET: string
      STRIPE_PRICE_ID: string
      MAILGUN_API_KEY: string
      MAILGUN_DOMAIN: string
      APP_URL: string
    }
  }
}

export {}