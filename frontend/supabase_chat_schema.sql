-- 🔥 DROP EXISTING TABLES TO FIX CONFLICTS (WARNING: DELETES CHAT HISTORY)
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.chat_personal;

-- Create Subscription table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  creator_id text not null,
  user_id text not null,
  tier_name text not null, -- 'Bronze', 'Silver', 'Gold'
  status text not null, -- 'Done', 'Active', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_creator_id_idx on public.subscriptions (creator_id);

-- RLS
alter table public.subscriptions enable row level security;
create policy "Allow read access for all users" on public.subscriptions for select using (true);
create policy "Allow insert access for authenticated users" on public.subscriptions for insert with check (auth.role() = 'authenticated' OR true);

-- Create Chat Personal table (Rooms)
create table if not exists public.chat_personal (
  id uuid default gen_random_uuid() primary key,
  user1_id text not null,
  user2_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookup of user chats
create index if not exists chat_personal_user1_idx on public.chat_personal (user1_id);
create index if not exists chat_personal_user2_idx on public.chat_personal (user2_id);

-- Enable RLS
alter table public.chat_personal enable row level security;

-- Policy
create policy "Allow read access for all users" on public.chat_personal for select using (true);
create policy "Allow insert access for authenticated users" on public.chat_personal for insert with check (auth.role() = 'authenticated' OR true);


-- Create the Messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid not null, -- Links to chat_personal.id
  sender_id text not null, -- User's wallet address or ID
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Add index for performance
create index if not exists messages_chat_id_idx on public.messages (chat_id);
create index if not exists messages_sender_id_idx on public.messages (sender_id);

-- Enable Row Level Security (RLS)
alter table public.messages enable row level security;

-- Policy: Allow read access to everyone (for now, or refine based on chat membership)
create policy "Allow read access for all users"
on public.messages for select
using (true);

-- Policy: Allow insert access to authenticated users
create policy "Allow insert access for authenticated users"
on public.messages for insert
with check (auth.role() = 'authenticated' OR true); -- 'OR true' for open dev access, remove for prod
