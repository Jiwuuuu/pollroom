# PollRoom

A real-time poll web app. Create a poll, share the link, and see votes update live.

## Tech Stack

- Next.js 16 (App Router) with TypeScript
- Supabase (PostgreSQL + Realtime)
- Tailwind CSS + shadcn/ui
- Playwright for end-to-end tests

## Project Structure

```
app/            Pages and API route handlers
components/     React components
hooks/          Custom React hooks
lib/            Utilities, Supabase clients, types, constants
e2e/            Playwright end-to-end tests
proxy.ts        Rate limiting proxy (runs on all API routes)
```

## API Routes

- `POST /api/polls` -- Create a new poll
- `GET /api/polls/[id]` -- Get poll details and vote counts
- `POST /api/polls/[id]/vote` -- Cast a vote

## Database

Three tables in Supabase:

- `polls` -- Stores poll questions
- `options` -- Stores poll options (linked to a poll)
- `votes` -- Stores individual votes with fingerprint and IP deduplication

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
2. Install dependencies:
   ```
   npm install
   ```
3. Run the dev server:
   ```
   npm run dev
   ```
4. Run tests:
   ```
   npm test
   ```
