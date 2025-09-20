# Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to Settings > API
3. Copy your Project URL and anon public key
4. Go to the SQL Editor and run the contents of `supabase/schema.sql`

## 3. Run the Application

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your LinkStacks app!

## 4. Create Your First Board

1. Click "Create Board" on the homepage
2. Enter a board path like `my-links` or `@username/project`
3. Start adding links with hierarchical tags

That's it! Your collaborative link curator is ready to use.
