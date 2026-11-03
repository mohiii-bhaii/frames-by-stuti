-- Frames by Stuti: editable website text.
--
-- One row per piece of text, keyed by the same ids the website uses
-- (for example "home.tagline"). The original wording lives in the code and is
-- the fallback, so a row only exists once someone has edited that text.
--
--   published_value  what visitors see. null means "use the original wording".
--   draft_value      the unpublished edit, valid only while has_draft is true.
--                    null with has_draft means "go back to the original wording".
--
-- Visitors read published text only, through get_published_texts(). Everything
-- else is limited to allowlisted admins.

create table public.site_texts (
  key text primary key check (key ~ '^[a-z0-9.-]{1,80}$'),
  published_value text check (char_length(published_value) <= 3000),
  draft_value text check (char_length(draft_value) <= 3000),
  has_draft boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users (id) on delete set null
);

alter table public.site_texts enable row level security;

create policy "Admins read texts" on public.site_texts
  for select to authenticated using ((select public.is_admin()));
create policy "Admins add texts" on public.site_texts
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins change texts" on public.site_texts
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
-- No delete policy: rows are never removed, only reset.

create index site_texts_updated_by_idx on public.site_texts (updated_by);

-- Public read: published text only.
create function public.get_published_texts()
returns table (key text, value text)
language sql
stable
security definer
set search_path = ''
as $$
  select t.key, t.published_value
  from public.site_texts t
  where t.published_value is not null;
$$;

revoke all on function public.get_published_texts() from public;
grant execute on function public.get_published_texts() to anon, authenticated;

-- Publishing: moves every draft live in one statement.
create function public.publish_text_drafts()
returns setof text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised to publish' using errcode = '42501';
  end if;

  return query
  update public.site_texts t
  set published_value = t.draft_value,
      draft_value = null,
      has_draft = false,
      updated_at = now()
  where t.has_draft
  returning t.key;
end;
$$;

revoke all on function public.publish_text_drafts() from public, anon;
grant execute on function public.publish_text_drafts() to authenticated;
