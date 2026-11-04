-- Contact form inquiries.
--
-- Visitors can only add an inquiry through submit_inquiry(), which validates
-- the data and limits how fast inquiries arrive. Nobody can read the table
-- except signed-in admins, so customer details are never public.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 5 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
  phone text not null default '' check (char_length(phone) <= 40),
  instagram text not null default '' check (char_length(instagram) <= 60),
  session_type text not null check (session_type in ('portraits', 'couples', 'family', 'milestones', 'other')),
  referral text not null default '' check (referral in ('', 'Instagram', 'Google', 'Friend or family', 'Other')),
  location text not null default '' check (char_length(location) <= 120),
  message text not null default '' check (char_length(message) <= 4000),
  preferred_date date,
  is_read boolean not null default false
);

create index inquiries_created_at_idx on public.inquiries (created_at desc);
create index inquiries_email_idx on public.inquiries (lower(email), created_at desc);

alter table public.inquiries enable row level security;

create policy "Admins read inquiries" on public.inquiries
  for select to authenticated using ((select public.is_admin()));
create policy "Admins mark inquiries read" on public.inquiries
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
-- No insert or delete policy: visitors submit through submit_inquiry() only.

create function public.submit_inquiry(
  p_name text,
  p_email text,
  p_phone text,
  p_instagram text,
  p_session_type text,
  p_referral text,
  p_location text,
  p_message text,
  p_preferred_date date
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
  select count(*) into recent_total from public.inquiries where created_at > now() - interval '1 hour';
  if recent_total >= 40 then
    raise exception 'Too many inquiries right now. Please try again later.' using errcode = 'P0001';
  end if;

  select count(*) into recent_email from public.inquiries
    where lower(email) = lower(btrim(p_email)) and created_at > now() - interval '1 hour';
  if recent_email >= 3 then
    raise exception 'You have already sent a few inquiries. Please wait a little before sending another.' using errcode = 'P0001';
  end if;

  if p_preferred_date is not null and (p_preferred_date < current_date - 1 or p_preferred_date > current_date + 1500) then
    raise exception 'Please choose a preferred date in the future.' using errcode = 'P0001';
  end if;

  insert into public.inquiries (name, email, phone, instagram, session_type, referral, location, message, preferred_date)
  values (btrim(p_name), lower(btrim(p_email)), btrim(coalesce(p_phone, '')), btrim(coalesce(p_instagram, '')),
          p_session_type, coalesce(p_referral, ''), btrim(coalesce(p_location, '')), btrim(coalesce(p_message, '')), p_preferred_date)
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_inquiry(text, text, text, text, text, text, text, text, date) from public;
grant execute on function public.submit_inquiry(text, text, text, text, text, text, text, text, date) to anon, authenticated;
