-- Text keys such as "about.heroStory" and "site.instagramHandle" contain capital
-- letters. The original rule only allowed lowercase, so saving those texts was
-- rejected by the database and their edits never reached Supabase.
alter table public.site_texts drop constraint site_texts_key_check;
alter table public.site_texts
  add constraint site_texts_key_check check (key ~ '^[A-Za-z0-9.-]{1,80}$');
