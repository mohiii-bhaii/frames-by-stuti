-- Frames by Stuti: FAQ and The Journal (blog).
--
-- Additive and safe: two new tables and their functions. Nothing existing is changed.
--
-- Both follow the website's draft/publish model:
--   the "live" columns   what visitors see once status = 'published'
--   draft (jsonb)        unpublished edits to those fields; Publish copies them live
--   status               draft        never published
--                        published    visible to visitors
--                        unpublished  taken down (the content is kept and can be republished)
--
-- Visitors never read the tables. They call the get_published_* functions, which return
-- published content only (never the draft column). Everything else needs an allowlisted admin.

-- ---------------------------------------------------------------- FAQ

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  sort_order integer not null default 0,
  question text not null default '' check (char_length(question) <= 300),
  answer text not null default '' check (char_length(answer) <= 4000),
  category text not null default 'general' check (category in ('booking', 'newborn', 'maternity', 'family', 'general')),
  show_on_home boolean not null default false,
  draft jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faq_items enable row level security;

create policy "Admins read faq" on public.faq_items
  for select to authenticated using ((select public.is_admin()));
create policy "Admins add faq" on public.faq_items
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins change faq" on public.faq_items
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete faq" on public.faq_items
  for delete to authenticated using ((select public.is_admin()));

create index faq_items_order_idx on public.faq_items (sort_order, created_at);

create function public.get_published_faqs()
returns table (id uuid, question text, answer text, category text, show_on_home boolean, sort_order integer)
language sql
stable
security definer
set search_path = ''
as $$
  select f.id, f.question, f.answer, f.category, f.show_on_home, f.sort_order
  from public.faq_items f
  where f.status = 'published' and f.question <> '' and f.answer <> ''
  order by f.sort_order, f.created_at;
$$;

revoke all on function public.get_published_faqs() from public;
grant execute on function public.get_published_faqs() to anon, authenticated;

-- Makes one FAQ item's saved draft live (or republishes it as it is). Returns false if it has nothing to publish.
create function public.publish_faq(p_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  published integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorised to publish' using errcode = '42501';
  end if;

  update public.faq_items f
  set question = coalesce(f.draft ->> 'question', f.question),
      answer = coalesce(f.draft ->> 'answer', f.answer),
      category = coalesce(f.draft ->> 'category', f.category),
      show_on_home = coalesce((f.draft ->> 'show_on_home')::boolean, f.show_on_home),
      draft = null,
      status = 'published',
      published_at = coalesce(f.published_at, now()),
      updated_at = now()
  where f.id = p_id
    and btrim(coalesce(f.draft ->> 'question', f.question)) <> ''
    and btrim(coalesce(f.draft ->> 'answer', f.answer)) <> '';
  get diagnostics published = row_count;
  return published = 1;
end;
$$;

revoke all on function public.publish_faq(uuid) from public, anon;
grant execute on function public.publish_faq(uuid) to authenticated;

-- ---------------------------------------------------------------- Journal

create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  is_featured boolean not null default false,
  slug text not null unique default ('post-' || substr(gen_random_uuid()::text, 1, 8))
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title text not null default '' check (char_length(title) <= 200),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  body text not null default '' check (char_length(body) <= 100000),
  category text not null default 'photography-tips'
    check (category in ('newborn', 'maternity', 'family', 'milestones', 'events', 'photography-tips')),
  featured_media_id uuid references public.photo_files (id) on delete set null,
  featured_alt text not null default '' check (char_length(featured_alt) <= 300),
  seo_title text not null default '' check (char_length(seo_title) <= 120),
  seo_description text not null default '' check (char_length(seo_description) <= 300),
  published_at timestamptz,
  draft jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_posts enable row level security;

create policy "Admins read journal" on public.journal_posts
  for select to authenticated using ((select public.is_admin()));
create policy "Admins add journal" on public.journal_posts
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins change journal" on public.journal_posts
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete journal" on public.journal_posts
  for delete to authenticated using ((select public.is_admin()));

create index journal_posts_published_idx on public.journal_posts (published_at desc);
create index journal_posts_featured_media_idx on public.journal_posts (featured_media_id);

-- Published articles for lists (no body text).
create function public.get_published_posts()
returns table (
  id uuid, slug text, title text, excerpt text, category text, is_featured boolean, published_at timestamptz,
  featured_path text, featured_width integer, featured_height integer, featured_alt text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.slug, p.title, p.excerpt, p.category, p.is_featured, p.published_at,
         m.storage_path, m.width, m.height, p.featured_alt
  from public.journal_posts p
  left join public.photo_files m on m.id = p.featured_media_id
  where p.status = 'published' and p.title <> ''
  order by p.published_at desc nulls last, p.created_at desc;
$$;

revoke all on function public.get_published_posts() from public;
grant execute on function public.get_published_posts() to anon, authenticated;

-- One published article, with its body.
create function public.get_published_post(p_slug text)
returns table (
  id uuid, slug text, title text, excerpt text, body text, category text, is_featured boolean, published_at timestamptz,
  featured_path text, featured_width integer, featured_height integer, featured_alt text,
  seo_title text, seo_description text, updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.slug, p.title, p.excerpt, p.body, p.category, p.is_featured, p.published_at,
         m.storage_path, m.width, m.height, p.featured_alt, p.seo_title, p.seo_description, p.updated_at
  from public.journal_posts p
  left join public.photo_files m on m.id = p.featured_media_id
  where p.status = 'published' and p.title <> '' and p.slug = p_slug;
$$;

revoke all on function public.get_published_post(text) from public;
grant execute on function public.get_published_post(text) to anon, authenticated;

-- Makes an article's saved draft live (or republishes it as it is). Returns false if it has no title.
create function public.publish_journal_post(p_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  published integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorised to publish' using errcode = '42501';
  end if;

  update public.journal_posts p
  set slug = coalesce(p.draft ->> 'slug', p.slug),
      title = coalesce(p.draft ->> 'title', p.title),
      excerpt = coalesce(p.draft ->> 'excerpt', p.excerpt),
      body = coalesce(p.draft ->> 'body', p.body),
      category = coalesce(p.draft ->> 'category', p.category),
      featured_media_id = case when p.draft ? 'featured_media_id' then nullif(p.draft ->> 'featured_media_id', '')::uuid else p.featured_media_id end,
      featured_alt = coalesce(p.draft ->> 'featured_alt', p.featured_alt),
      seo_title = coalesce(p.draft ->> 'seo_title', p.seo_title),
      seo_description = coalesce(p.draft ->> 'seo_description', p.seo_description),
      published_at = coalesce(nullif(p.draft ->> 'published_at', '')::timestamptz, p.published_at, now()),
      draft = null,
      status = 'published',
      updated_at = now()
  where p.id = p_id
    and btrim(coalesce(p.draft ->> 'title', p.title)) <> '';
  get diagnostics published = row_count;
  return published = 1;
end;
$$;

revoke all on function public.publish_journal_post(uuid) from public, anon;
grant execute on function public.publish_journal_post(uuid) to authenticated;

-- Only one article can be the featured one.
create function public.set_featured_journal_post(p_id uuid, p_featured boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if p_featured then
    update public.journal_posts set is_featured = false where is_featured and id <> p_id;
  end if;
  update public.journal_posts set is_featured = p_featured, updated_at = now() where id = p_id;
end;
$$;

revoke all on function public.set_featured_journal_post(uuid, boolean) from public, anon;
grant execute on function public.set_featured_journal_post(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------- Starter drafts (not published)
--
-- Nothing here is visible to visitors until it is published in the editor. The FAQ answers are the
-- owner's own wording. The article drafts are outlines with [bracketed] notes for the owner to
-- complete: they contain no client stories, prices, studio locations or credentials.

insert into public.faq_items (sort_order, category, show_on_home, question, answer) values
  (10, 'newborn', true, 'When is the best time to book a newborn session?',
   'It’s always a good idea to get in touch before your little one arrives! Newborn sessions are often planned during the first couple of weeks, when babies tend to be sleepier and easier to settle. But every baby is different, and beautiful memories can be captured at any age.'),
  (20, 'newborn', true, 'What if my baby doesn’t sleep during the session?',
   'Please don’t worry! Babies have their own little plans, and that’s completely okay. We’ll take our time, allow breaks whenever needed, and follow your baby’s comfort throughout the session.'),
  (30, 'family', true, 'What should we wear for our photography session?',
   'Soft, neutral colours and comfortable outfits photograph beautifully. Once your session is booked, I can help you plan outfits that feel natural and work well together.'),
  (40, 'general', true, 'Do you photograph maternity and family sessions too?',
   'Absolutely! I love documenting all the beautiful chapters of family life, from maternity and newborn moments to milestones, family portraits, and special celebrations.'),
  (50, 'general', true, 'Where do your photography sessions take place?',
   'Session locations depend on the type of photography you’re looking for. Get in touch and we can chat about the options that work best for your family.'),
  (60, 'booking', true, 'How do I book a session with Frames by Stuti?',
   'Simply reach out through my contact page and tell me a little about the session you’re dreaming of. I’ll help you with the next steps!');

insert into public.journal_posts (slug, category, title, excerpt, body, seo_title, seo_description) values
  ('best-time-for-newborn-photos-in-ottawa', 'newborn',
   'When Is the Best Time for Newborn Photos in Ottawa?',
   '[Add a short introduction for the Journal list: a sentence or two about when to plan newborn photos.]',
   E'[Draft outline: replace each bracketed note with your own words before publishing.]\n\n## Plan before your baby arrives\n\nIt’s always a good idea to get in touch before your little one arrives! [Add why early planning helps you and your baby.]\n\n## The first couple of weeks\n\nNewborn sessions are often planned during the first couple of weeks, when babies tend to be sleepier and easier to settle. [Add what a session feels like for a newborn.]\n\n## Every baby is different\n\nBeautiful memories can be captured at any age. [Add reassurance for families who are past the first weeks.]\n\n## Ready to plan your session?\n\n[Add a warm closing note.] You can [see newborn packages](/pricing/newborn) or [get in touch](/contact).',
   'When Is the Best Time for Newborn Photos in Ottawa?',
   '[Add a description of about 150 characters for search results.]'),
  ('how-to-prepare-for-your-newborn-photography-session', 'newborn',
   'How to Prepare for Your Newborn Photography Session',
   '[Add a short introduction for the Journal list.]',
   E'[Draft outline: replace each bracketed note with your own words before publishing.]\n\n## Before the session\n\n[Add your own preparation tips.]\n\n## On the day\n\nBabies have their own little plans, and that’s completely okay. [Add how you work at the baby’s pace, with breaks whenever needed.]\n\n## What to bring\n\n[Add your own list.]\n\n## Questions?\n\n[Add a warm closing note.] You can [see newborn packages](/pricing/newborn) or [get in touch](/contact).',
   'How to Prepare for Your Newborn Photography Session',
   '[Add a description of about 150 characters for search results.]'),
  ('what-to-wear-for-your-family-photoshoot', 'family',
   'What to Wear for Your Family Photoshoot',
   '[Add a short introduction for the Journal list.]',
   E'[Draft outline: replace each bracketed note with your own words before publishing.]\n\n## Soft, neutral and comfortable\n\nSoft, neutral colours and comfortable outfits photograph beautifully. [Add your own examples.]\n\n## Choosing outfits that work together\n\n[Add your tips for coordinating without matching.]\n\n## Help with outfits\n\nOnce your session is booked, I can help you plan outfits that feel natural and work well together.\n\n## Ready to plan your session?\n\n[Add a warm closing note.] You can [see family packages](/pricing/lifestyle) or [get in touch](/contact).',
   'What to Wear for Your Family Photoshoot',
   '[Add a description of about 150 characters for search results.]'),
  ('when-to-book-your-maternity-session', 'maternity',
   'When Should You Book Your Maternity Session?',
   '[Add a short introduction for the Journal list.]',
   E'[Draft outline: replace each bracketed note with your own words before publishing.]\n\n## Planning your maternity session\n\n[Add when you recommend booking and why.]\n\n## What to expect\n\n[Add what a maternity session is like.]\n\n## Ready to plan your session?\n\n[Add a warm closing note.] You can [see maternity packages](/pricing/maternity) or [get in touch](/contact).',
   'When Should You Book Your Maternity Session?',
   '[Add a description of about 150 characters for search results.]'),
  ('five-ways-to-celebrate-your-babys-milestones', 'milestones',
   'Five Beautiful Ways to Celebrate Your Baby’s Milestones',
   '[Add a short introduction for the Journal list.]',
   E'[Draft outline: replace each bracketed note with your own words before publishing.]\n\n## 1. [First idea]\n\n[Write about it.]\n\n## 2. [Second idea]\n\n[Write about it.]\n\n## 3. [Third idea]\n\n[Write about it.]\n\n## 4. [Fourth idea]\n\n[Write about it.]\n\n## 5. [Fifth idea]\n\n[Write about it.]\n\n## Ready to celebrate?\n\n[Add a warm closing note.] You can [see milestone packages](/pricing/milestones) or [get in touch](/contact).',
   'Five Beautiful Ways to Celebrate Your Baby’s Milestones',
   '[Add a description of about 150 characters for search results.]');
