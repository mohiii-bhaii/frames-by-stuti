-- Frames by Stuti: record whether each inquiry's notification email went out.
--
-- Additive and safe: existing columns and rows are untouched.
--
--   email_status        pending        saved, no email attempt recorded yet
--                       sent           the email service accepted the notification
--                       failed         the email service refused it, or the call failed
--                       not_configured email notifications were not set up at the time
--   email_error         why a notification failed (short, never a secret)
--   email_attempted_at  when the attempt was made
--
-- The website records the result through record_inquiry_email(), which only
-- accepts the first result for an inquiry and needs the inquiry's id AND its
-- one-time token, so nobody else can change it afterwards.

alter table public.inquiries
  add column email_status text not null default 'pending'
    check (email_status in ('pending', 'sent', 'failed', 'not_configured')),
  add column email_error text not null default '' check (char_length(email_error) <= 500),
  add column email_attempted_at timestamptz;

-- Inquiries saved before this existed never had a notification attempted.
update public.inquiries set email_status = 'not_configured' where email_status = 'pending';

create function public.record_inquiry_email(p_id uuid, p_token uuid, p_status text, p_error text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  if p_status not in ('sent', 'failed', 'not_configured') then
    raise exception 'Unknown email status' using errcode = 'P0001';
  end if;

  update public.inquiries
  set email_status = p_status,
      email_error = left(coalesce(p_error, ''), 500),
      email_attempted_at = now()
  where id = p_id
    and submission_token is not distinct from p_token
    and email_status = 'pending';

  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke all on function public.record_inquiry_email(uuid, uuid, text, text) from public;
grant execute on function public.record_inquiry_email(uuid, uuid, text, text) to anon, authenticated;
