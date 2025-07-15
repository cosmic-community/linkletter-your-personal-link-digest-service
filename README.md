# LinkLetter - Your Personal Link Digest Service

![LinkLetter Preview](https://imgix.cosmicjs.com/48bb8350-61a2-11f0-a051-23c10f41277a-photo-1472099645785-5658abf4ff4e-1752601007175.jpg?w=1200&h=300&fit=crop&auto=format,compress)

LinkLetter is a comprehensive SaaS platform that helps users save and organize links throughout the week, automatically sending them personalized email digests every Friday. The service features a freemium model with Stripe integration, allowing users to upgrade from basic link saving to unlimited links with optional third-party integrations.

## Features

- **User Authentication** - Complete signup/login system with email verification
- **Freemium Model** - Free tier (5 links/week) and paid tier (unlimited links)
- **Stripe Integration** - Secure payment processing and subscription management
- **Link Management** - Save links with URL, title, notes, and tags
- **Weekly Email Digests** - Automated Friday email delivery via Mailgun
- **User Dashboard** - Comprehensive interface for managing links and account settings
- **Admin Panel** - Complete user management and system analytics
- **Responsive Design** - Mobile-friendly interface built with Tailwind CSS
- **Third-party Integrations** - Optional Pocket and Notion integration support

## Clone this Bucket

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket to get started instantly:

[![Clone this Bucket](https://img.shields.io/badge/Clone%20this%20Bucket-4F46E5?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmic-staging.com/projects/new?clone_bucket=linkletter-production)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "Build a single-service SaaS website called "LinkLetter." 
> 
> The service lets users save article/bookmark links throughout the week, and every Friday it sends them a personalized email digest with their saved links.
> 
> Main Features:
> - User authentication (signup/login with email)
> - Free and paid tiers (Stripe integration):
>   - Free: Save up to 5 links per week
>   - Paid: Unlimited links, optional Pocket or Notion integration
> - Bookmark form with fields: URL, Title (optional), Notes (optional), Tags
> - Weekly email digest that sends saved links every Friday
> - Dashboard to view, edit, and delete saved links
> - Admin panel for managing users and reviewing link usage
> - Responsive layout using Tailwind CSS
> - Clean, modern UI with a single homepage CTA to sign up
> - Optional integrations placeholder (Pocket, Notion)
> 
> Use Cosmic CMS to:
> - Store users and their links
> - Track link counts per week
> - Trigger weekly email digest with Mailgun or another email service
> - Include paid plan metadata for user accounts
> 
> Deploy to Vercel and host everything in a single-page app with user dashboards behind login.
> 
> Make the whole app fast, mobile-friendly, and easy to customize."

### Code Generation Prompt

> Build a single-service SaaS website called "LinkLetter." 
> 
> The service lets users save article/bookmark links throughout the week, and every Friday it sends them a personalized email digest with their saved links.
> 
> Main Features:
> - User authentication (signup/login with email)
> - Free and paid tiers (Stripe integration):
>   - Free: Save up to 5 links per week
>   - Paid: Unlimited links, optional Pocket or Notion integration
> - Bookmark form with fields: URL, Title (optional), Notes (optional), Tags
> - Weekly email digest that sends saved links every Friday
> - Dashboard to view, edit, and delete saved links
> - Admin panel for managing users and reviewing link usage
> - Responsive layout using Tailwind CSS
> - Clean, modern UI with a single homepage CTA to sign up
> - Optional integrations placeholder (Pocket, Notion)
> 
> Use Cosmic CMS to:
> - Store users and their links
> - Track link counts per week
> - Trigger weekly email digest with Mailgun or another email service
> - Include paid plan metadata for user accounts
> 
> Deploy to Vercel and host everything in a single-page app with user dashboards behind login.
> 
> Make the whole app fast, mobile-friendly, and easy to customize.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: Cosmic CMS
- **Authentication**: JWT with bcrypt
- **Payments**: Stripe
- **Email**: Mailgun
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Cosmic account and bucket
- Stripe account (for payments)
- Mailgun account (for emails)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`:
   ```
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   STRIPE_SECRET_KEY=your-stripe-secret
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain
   ```

5. Run the development server:
   ```bash
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Cosmic SDK Examples

### Fetching User Links
```typescript
import { cosmic } from '@/lib/cosmic'

const userLinks = await cosmic.objects
  .find({
    type: 'links',
    'metadata.user': userId
  })
  .props(['id', 'title', 'metadata'])
  .depth(1)
```

### Creating a New Link
```typescript
const newLink = await cosmic.objects.insertOne({
  type: 'links',
  title: linkTitle,
  metadata: {
    url: linkUrl,
    title: linkTitle,
    notes: linkNotes,
    tags: linkTags,
    user: userId,
    date_saved: new Date().toISOString(),
    week_number: getWeekNumber(new Date()),
    year: new Date().getFullYear(),
    archived: false
  }
})
```

### Fetching App Settings
```typescript
const appSettings = await cosmic.objects
  .findOne({
    type: 'app-settings',
    slug: 'linkletter-configuration'
  })
  .props(['id', 'title', 'metadata'])
```

## Cosmic CMS Integration

The application uses Cosmic CMS to store and manage:

- **Users** - User accounts with subscription tiers and preferences
- **Links** - Saved links with metadata, tags, and tracking
- **Weekly Digests** - Email digest records with delivery status
- **App Settings** - System configuration and email templates

All data is managed through the Cosmic SDK with proper TypeScript interfaces and error handling.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Environment Variables

Make sure to set these environment variables in your production environment:

- `COSMIC_BUCKET_SLUG`
- `COSMIC_READ_KEY`
- `COSMIC_WRITE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`

For detailed deployment instructions, see the [Vercel documentation](https://vercel.com/docs) and [Cosmic documentation](https://www.cosmicjs.com/docs).

<!-- README_END -->