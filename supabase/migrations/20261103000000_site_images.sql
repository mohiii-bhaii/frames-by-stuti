-- Frames by Stuti: editable site photographs.
--
-- Tables
--   admin_users     allowlist of accounts that may edit the site (reused if it already exists)
--   photo_files     one row per uploaded file in the site-photos bucket
--   image_versions  every saved state of a slot (photo, alt text, crop); never updated in place
--   image_slots     one row per slot, pointing at its current draft and published version
--
-- The public site only reads through get_published_images(). Every table is
-- otherwise closed to everyone except allowlisted admins.

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Rows are managed from the Supabase SQL editor only.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

-- Returns false for anonymous visitors. Grants are left as they are, in case
-- existing policies elsewhere in the project already call this function.
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------------

create table public.photo_files (
  id uuid primary key default gen_random_uuid(),
  -- uploads/<uuid>/<safe file name>. A new folder per upload means files are never overwritten.
  storage_path text not null unique
    check (storage_path ~ '^uploads/[0-9a-f-]{36}/[A-Za-z0-9._-]{1,120}$'),
  filename text not null check (char_length(filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  width integer not null check (width between 1 and 20000),
  height integer not null check (height between 1 and 20000),
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null
);

create index photo_files_created_at_idx on public.photo_files (created_at desc);
create index photo_files_filename_idx on public.photo_files (lower(filename));

alter table public.photo_files enable row level security;

create policy "Admins read photo files" on public.photo_files
  for select to authenticated using ((select public.is_admin()));
create policy "Admins add photo files" on public.photo_files
  for insert to authenticated with check ((select public.is_admin()));
-- No update or delete policy: library entries are permanent.

-- ---------------------------------------------------------------------------
-- Slot versions and pointers
-- ---------------------------------------------------------------------------

create table public.image_versions (
  id uuid primary key default gen_random_uuid(),
  slot_id text not null check (slot_id ~ '^[a-z0-9-]{1,64}$'),
  -- null means the slot's built-in placeholder (or the text logo).
  media_id uuid references public.photo_files (id) on delete restrict,
  alt text not null default '' check (char_length(alt) <= 500),
  focal_x real not null default 50 check (focal_x between 0 and 100),
  focal_y real not null default 50 check (focal_y between 0 and 100),
  zoom real not null default 1 check (zoom between 1 and 4),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  -- Set once, when this version goes live. Used to find the previous published photo.
  published_at timestamptz
);

create index image_versions_slot_idx on public.image_versions (slot_id, published_at desc nulls last);
create index image_versions_media_idx on public.image_versions (media_id);

alter table public.image_versions enable row level security;

create policy "Admins read versions" on public.image_versions
  for select to authenticated using ((select public.is_admin()));
create policy "Admins add versions" on public.image_versions
  for insert to authenticated with check ((select public.is_admin()) and published_at is null);
create policy "Admins publish versions" on public.image_versions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.image_slots (
  slot_id text primary key check (slot_id ~ '^[a-z0-9-]{1,64}$'),
  draft_version_id uuid references public.image_versions (id) on delete set null,
  published_version_id uuid references public.image_versions (id) on delete set null,
  updated_at timestamptz not null default now()
);

create index image_slots_draft_idx on public.image_slots (draft_version_id);
create index image_slots_published_idx on public.image_slots (published_version_id);

alter table public.image_slots enable row level security;

create policy "Admins read slots" on public.image_slots
  for select to authenticated using ((select public.is_admin()));
create policy "Admins add slots" on public.image_slots
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins change slots" on public.image_slots
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Public read: published photographs only
-- ---------------------------------------------------------------------------

create function public.get_published_images()
returns table (
  slot_id text,
  version_id uuid,
  storage_path text,
  width integer,
  height integer,
  alt text,
  focal_x real,
  focal_y real,
  zoom real
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.slot_id, v.id, m.storage_path, m.width, m.height, v.alt, v.focal_x, v.focal_y, v.zoom
  from public.image_slots s
  join public.image_versions v on v.id = s.published_version_id
  left join public.photo_files m on m.id = v.media_id;
$$;

revoke all on function public.get_published_images() from public;
grant execute on function public.get_published_images() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Publishing: moves drafts live in one transaction
-- ---------------------------------------------------------------------------

create function public.publish_image_drafts(slot_ids text[] default null)
returns setof text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised to publish' using errcode = '42501';
  end if;

  update public.image_versions v
  set published_at = now()
  from public.image_slots s
  where s.draft_version_id = v.id
    and (slot_ids is null or s.slot_id = any (slot_ids));

  return query
  update public.image_slots s
  set published_version_id = s.draft_version_id,
      draft_version_id = null,
      updated_at = now()
  where s.draft_version_id is not null
    and (slot_ids is null or s.slot_id = any (slot_ids))
  returning s.slot_id;
end;
$$;

revoke all on function public.publish_image_drafts(text[]) from public, anon;
grant execute on function public.publish_image_drafts(text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket, admin-only uploads, no overwrites or deletes
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-photos', 'site-photos', true, 26214400, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins upload site photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-photos'
    and (storage.foldername(name))[1] = 'uploads'
    and (select public.is_admin())
  );

create policy "Admins list site photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-photos' and (select public.is_admin()));
-- No update or delete policy: uploaded files can't be overwritten or removed through the API.
