# Findamine

GPS-powered educational scavenger hunts for classrooms and families.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: Anthropic Claude + OpenAI
- **Maps**: Google Maps API
- **Deployment**: Vercel

## Getting Started

1. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    api/v1/        # REST API routes (web + mobile)
    (pages)        # Web app pages
  lib/
    supabase/      # Supabase client helpers
    queries/       # Read-only data access
    services/      # Business logic
    types/         # TypeScript types and enums
    utils/         # Auth helpers, rate limiting
  components/      # React components
  middleware.ts    # Session refresh
supabase/
  migrations/      # SQL migrations
```
