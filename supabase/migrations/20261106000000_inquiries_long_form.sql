-- Long-form contact inquiry: first and last name, required phone, session type
-- list, due date, location preference, preferred weekdays and a required message.
--
-- Additive and safe: existing columns and rows are untouched (old inquiries keep
-- their single "name" and any values they had). The earlier 9-argument
-- submit_inquiry() stays until the new site is live; see the follow-up
-- migration that retires it.

alter table public.inquiries
  add column first_name text not null default '' check (char_length(first_name) <= 80),
  add column last_name text not null default '' check (char_length(last_name) <= 80),
  add column due_date date,
  add column location_preference text not null default '' check (location_preference in ('', 'Studio', 'Outdoor', 'At Home', 'Other')),
  add column preferred_days text[] not null default '{}'
    check (preferred_days <@ array['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']::text[] and cardinality(preferred_days) <= 7),
  add column submission_token uuid unique;

alter table public.inquiries drop constraint inquiries_session_type_check;
alter table public.inquiries add constraint inquiries_session_type_check check (
  session_type in ('newborn','maternity','cake-smash','family','milestones','couples','portraits','seniors','events','other')
);

alter table public.inquiries drop constraint inquiries_referral_check;
alter table public.inquiries add constraint inquiries_referral_check check (
  referral in ('', 'Instagram', 'Google', 'Friend or family', 'Previous client', 'Other')
);

-- Returns null for a repeat of a submission it has already saved (same token),
-- so a double tap or a retry never creates a duplicate.
create function public.submit_inquiry(
  p_token uuid,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_email text,
  p_session_type text,
  p_due_date date,
  p_location_preference text,
  p_location text,
  p_preferred_days text[],
  p_message text,
  p_referral text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_total integer;
  recent_email integer;
  new_id uuid;
begin
  if btrim(coalesce(p_first_name, '')) = '' or btrim(coalesce(p_last_name, '')) = ''
     or btrim(coalesce(p_phone, '')) = '' or btrim(coalesce(p_message, '')) = ''
     or coalesce(cardinality(p_preferred_days), 0) < 1 then
    raise exception 'Please fill in every required field.' using errcode = 'P0001';
  end if;

  if p_token is not null and exists (select 1 from public.inquiries where submission_token = p_token) then
    return null;
  end if;

  select count(*) into recent_total from public.inquiries where created_at > now() - interval '1 hour';
  if recent_total >= 40 then
    raise exception 'Too many inquiries right now. Please try again later.' using errcode = 'P0001';
  end if;

  select count(*) into recent_email from public.inquiries
    where lower(email) = lower(btrim(p_email)) and created_at > now() - interval '1 hour';
  if recent_email >= 3 then
    raise exception 'You have already sent a few inquiries. Please wait a little before sending another.' using errcode = 'P0001';
  end if;

  if p_due_date is not null and (p_due_date < current_date - 60 or p_due_date > current_date + 400) then
    raise exception 'Please check your due date.' using errcode = 'P0001';
  end if;

  insert into public.inquiries (
    submission_token, name, first_name, last_name, phone, email, session_type, due_date,
    location_preference, location, preferred_days, message, referral
  )
  values (
    p_token, btrim(btrim(p_first_name) || ' ' || btrim(p_last_name)), btrim(p_first_name), btrim(p_last_name),
    btrim(p_phone), lower(btrim(p_email)), p_session_type, p_due_date,
    coalesce(p_location_preference, ''), btrim(coalesce(p_location, '')), p_preferred_days,
    btrim(p_message), coalesce(p_referral, '')
  )
  on conflict (submission_token) do nothing
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_inquiry(uuid, text, text, text, text, text, date, text, text, text[], text, text) from public;
grant execute on function public.submit_inquiry(uuid, text, text, text, text, text, date, text, text, text[], text, text) to anon, authenticated;
