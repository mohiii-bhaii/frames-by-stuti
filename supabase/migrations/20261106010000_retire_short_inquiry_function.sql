-- The long-form site is live and only calls the 12-argument submit_inquiry().
-- Remove the earlier 9-argument version so there is a single, strict entry point.
drop function if exists public.submit_inquiry(text, text, text, text, text, text, text, text, date);
