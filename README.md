# LinkStacks

A collaborative link curator with hierarchical tags, multi-segment board paths, and drag-and-drop reordering. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Hierarchical Tag Organization**: Organize links with nested tags like "Tech/AI/Agents"
- **Multi-Segment Board Paths**: Create boards at paths like `@username/project` or `teams/alpha/ai`
- **Drag-and-Drop Reordering**: Reorder links within tags with intuitive drag-and-drop
- **Automatic Metadata Fetching**: Automatically fetch link titles using multiple fallback APIs
- **Collaborative Editing**: Share boards and collaborate in real-time
- **Global Search**: Search across all links in a board
- **Keyboard Shortcuts**: Efficient navigation with keyboard shortcuts
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: SWR for data fetching and caching
- **Drag & Drop**: @dnd-kit for smooth reordering
- **Validation**: Zod for runtime type validation
- **Icons**: Lucide React

## Free Metadata Pipeline

LinkStacks uses a cascading fallback system to automatically fetch link metadata:

1. **Microlink API** (Primary): `https://api.microlink.io?url=...`
   - Free tier with 3-second timeout
   - Extracts title from `data.title`, `data.meta.title`, or `data.data.title`

2. **Jina Reader** (Fallback 1): `https://r.jina.ai/http://...`
   - Free HTML scraping service
   - Parses `<title>` tag from returned HTML

3. **Hostname Extraction** (Fallback 2): `new URL(url).hostname`
   - Final fallback using the URL's hostname
   - Never fails, always provides a title

The system includes rate limiting (10 requests per domain per 30 seconds) and graceful error handling to ensure link insertion never fails due to metadata fetching issues.

## Multi-Segment Board Paths

Boards can exist at complex hierarchical paths:

- **Simple**: `my-project`
- **Personal**: `@krishna/movies`
- **Team**: `teams/alpha/ai`
- **Nested**: `organizations/acme/engineering/frontend`

### Path Rules

- 3-80 characters total
- Lowercase letters, numbers, `@`, `.`, `_`, `-`, and `/` separators
- Each segment: 1-24 characters
- Automatically normalized (lowercase, duplicate slash removal)

## Multi-Tag Model

Links can belong to multiple hierarchical tag paths simultaneously:

```typescript
// A single link can have multiple tag paths
const link = {
  url: "https://openai.com/blog/chatgpt",
  title: "ChatGPT Blog Post",
  tagPaths: [
    "Tech/AI/Chatbots",
    "Startups/AI",
    "Research/NLP"
  ]
}
```

This allows for flexible categorization where a link about AI chatbots can appear in both the "Tech" and "Startups" hierarchies.

## Database Schema

### Boards Table
```sql
create table public.boards (
  id uuid primary key default gen_random_uuid(),
  slug_path text not null,             -- e.g., '@krishna/movies'
  slug_segments text[] not null,       -- e.g., ['@krishna','movies']
  title text,
  created_at timestamptz not null default now()
);
```

### Links Table
```sql
create table public.links (
  id bigint generated always as identity primary key,
  board_id uuid not null references public.boards(id) on delete cascade,
  url text not null,
  title text,
  client_id text,                      -- anonymous local identifier
  soft_deleted boolean not null default false,
  created_at timestamptz not null default now()
);
```

### Link Tags Table (Many-to-Many)
```sql
create table public.link_tags (
  link_id bigint not null references public.links(id) on delete cascade,
  tag_path text not null,              -- e.g., 'Tech/AI/Agents'
  position integer not null default 0, -- ordering within (board, tag_path)
  primary key (link_id, tag_path)
);
```

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd linkstacks
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema from `supabase/schema.sql` in the SQL editor

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# External API Configuration (optional - defaults provided)
NEXT_PUBLIC_MICROLINK_BASE=https://api.microlink.io
NEXT_PUBLIC_JINA_READER_BASE=https://r.jina.ai
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with default Next.js settings

The app is frontend-only and works entirely from the browser with Supabase's anon key.

## Usage

### Creating Boards

1. Visit the homepage
2. Click "Create Board" or "Get Started"
3. Enter a board path (e.g., `my-project`, `@username/links`)
4. Start adding links with tags

### Adding Links

1. Click "Add Link" button
2. Paste a URL (title auto-fetches)
3. Add hierarchical tags (e.g., `Tech/AI`, `Startups/Fintech`)
4. Submit to add the link

### Organizing Links

- **Drag and Drop**: Reorder links within tags
- **Multiple Tags**: Add links to multiple tag paths
- **Inline Editing**: Click to edit link titles
- **Search**: Use global search to find links
- **Soft Delete**: Links are soft-deleted, not permanently removed

### Keyboard Shortcuts

- `A` - Focus Add Link form
- `⌘/Ctrl + K` - Focus search
- `Esc` - Clear search or cancel editing
- `Enter` - Save edits or add tags

## API Endpoints

The app uses Supabase's auto-generated REST API with Row Level Security:

- **Boards**: `GET /rest/v1/boards`
- **Links**: `GET /rest/v1/links`
- **Link Tags**: `GET /rest/v1/link_tags`

All operations use the anon key with permissive RLS policies for open collaboration.

## Rate Limiting

Client-side rate limiting prevents abuse:

- **Metadata Fetching**: 10 requests per domain per 30 seconds
- **Mutations**: 10 operations per 30 seconds (stored in localStorage)
- **Graceful Degradation**: Operations continue even when rate limited

## Security

- **Row Level Security**: All tables have RLS enabled
- **Anonymous Access**: No authentication required
- **Input Validation**: Zod schemas validate all inputs
- **CORS Protection**: External API calls respect CORS policies
- **XSS Prevention**: React's built-in XSS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the [Issues](https://github.com/your-repo/linkstacks/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## Roadmap

- [ ] Import/export board JSON
- [ ] Share filtered views with URL parameters
- [ ] Undo functionality with snackbar
- [ ] Minimal analytics integration
- [ ] Board templates
- [ ] Link previews
- [ ] Collaborative cursors
- [ ] API for third-party integrations