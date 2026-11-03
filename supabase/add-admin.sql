-- Run in the Supabase SQL editor after creating Stuti's user under
-- Authentication > Users > Add user. Replace the email address first.
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('stuti@example.com')
on conflict (user_id) do nothing;

-- Check it worked: this should list her email address.
select u.email from public.admin_users a join auth.users u on u.id = a.user_id;
