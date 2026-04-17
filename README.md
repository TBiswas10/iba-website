# Illawarra Bengali Association (IBA) Website

A community website for the Illawarra Bengali Association, built with Next.js, React, and TypeScript.

## Features

- **Membership Management** - Join as a member, manage subscriptions
- **Events** - View and RSVP to community events
- **Gallery** - Browse photos and videos from events
- **Donations** - Support the community with direct transfer or Stripe
- **Contact Form** - Get in touch with the association
- **Resources** - Links to community resources
- **Admin Dashboard** - Manage members, events, donations, and more

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Firebase Authentication + NextAuth
- **Payments**: Stripe
- **Styling**: CSS Modules + Tailwind CSS
- **i18n**: next-intl (English + Bengali)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase)
- Firebase project for authentication
- Stripe account (optional, for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/TBiswas10/iba-website.git
cd iba-website

# Install dependencies
npm install

# Set up environment variables
cp .env .env.local
# Edit .env.local with your configuration

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe (optional)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Your Name <email@example.com>"
```

### Deployment

The app is deployed on Vercel. To deploy:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
├── prisma/          # Database schema
├── src/
│   ├── app/         # Next.js App Router pages
│   ├── components/  # React components
│   ├── lib/         # Utilities (Firebase, Prisma, etc.)
│   ├── i18n/        # Internationalization
│   └── messages/    # Translation files
└── public/          # Static assets
```

## License

MIT