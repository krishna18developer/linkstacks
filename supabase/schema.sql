create extension if not exists pgcrypto;

-- Boards can live at multi-segment paths; store normalized path as a single string and also an array for convenience.
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  slug_path text not null,             -- e.g., '@krishna/movies'
  slug_segments text[] not null,       -- e.g., ['@krishna','movies']
  title text,
  created_at timestamptz not null default now(),
  constraint slug_path_len check (char_length(slug_path) between 3 and 80),
  constraint slug_path_normalized check (slug_path = lower(slug_path))
);
create unique index if not exists boards_slug_path_uidx on public.boards (slug_path);

-- Links are rows; text/title stored here (no dedupe needed).
create table if not exists public.links (
  id bigint generated always as identity primary key,
  board_id uuid not null references public.boards(id) on delete cascade,
  url text not null,
  title text,
  client_id text,                      -- anonymous local identifier
  soft_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

-- Many-to-many link ↔ tag_path so a link can appear in multiple hierarchical paths.
create table if not exists public.link_tags (
  link_id bigint not null references public.links(id) on delete cascade,
  tag_path text not null,              -- e.g., 'Tech/AI/Agents'
  position integer not null default 0, -- ordering within (board, tag_path)
  primary key (link_id, tag_path)
);
create index if not exists link_tags_board_tag_idx on public.link_tags (tag_path, position);
-- (board_id is derivable by joining via links)

alter table public.boards enable row level security;
alter table public.links enable row level security;
alter table public.link_tags enable row level security;

-- OPEN collaboration (anon read/write). Tune later if needed.
create policy "boards_select_all" on public.boards for select using (true);
create policy "boards_insert_any" on public.boards for insert with check (true);
create policy "boards_update_any" on public.boards for update using (true) with check (true);
create policy "boards_delete_any" on public.boards for delete using (true);

create policy "links_select_visible" on public.links for select using (soft_deleted = false);
create policy "links_insert_any" on public.links for insert with check (true);
create policy "links_update_any" on public.links for update using (true) with check (true);
create policy "links_delete_any" on public.links for delete using (true);

create policy "link_tags_select_all" on public.link_tags for select using (true);
create policy "link_tags_insert_any" on public.link_tags for insert with check (true);
create policy "link_tags_update_any" on public.link_tags for update using (true) with check (true);
create policy "link_tags_delete_any" on public.link_tags for delete using (true);
