-- Frames by Stuti: allow long-form text (a full personal story) in the editor.
--
-- The site_texts table capped published and draft text at 3000 characters. The
-- ceiling is now 30000. The editor and the server action still apply a tighter
-- limit to short fields (titles, buttons), so only long-form text can be long.
-- Existing text is unchanged.

alter table public.site_texts drop constraint site_texts_published_value_check;
alter table public.site_texts drop constraint site_texts_draft_value_check;

alter table public.site_texts
  add constraint site_texts_published_value_check check (char_length(published_value) <= 30000),
  add constraint site_texts_draft_value_check check (char_length(draft_value) <= 30000);
