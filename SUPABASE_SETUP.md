# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `linkstacks` (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Create Environment File

Create a file called `.env.local` in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL

## Step 5: Test the Connection

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Try creating a board

## Common Issues & Solutions

### 404 Errors
- **Check your Project URL**: Make sure it's exactly `https://your-project-id.supabase.co`
- **No trailing slash**: Don't add `/` at the end of the URL
- **Project is active**: Make sure your Supabase project is not paused

### Authentication Errors
- **Check your anon key**: Make sure it's the `anon public` key, not the `service_role` key
- **Key is complete**: The anon key should be very long (starts with `eyJ`)

### Database Errors
- **Schema not applied**: Make sure you ran the SQL schema in the SQL Editor
- **RLS policies**: The schema includes Row Level Security policies for open access

### Environment Variables Not Loading
- **File name**: Must be exactly `.env.local` (not `.env` or `.env.local.txt`)
- **Location**: Must be in the project root (same level as `package.json`)
- **Restart server**: After creating `.env.local`, restart `npm run dev`

## Verification Steps

1. **Check environment variables are loaded**:
   - Open browser dev tools
   - Go to Console
   - Type: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
   - Should show your Supabase URL

2. **Test Supabase connection**:
   - In browser console, type:
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY')
   supabase.from('boards').select('*').then(console.log)
   ```

## Still Having Issues?

If you're still getting errors, please share:
1. The exact error message you're seeing
2. Your `.env.local` file (with keys redacted)
3. Whether you've run the SQL schema
4. Your Supabase project status (active/paused)
