-- The owner's eight starter FAQs, published, replacing the six untouched starter drafts from the
-- previous migration. Drafts the owner has edited are left alone.
delete from public.faq_items
where status = 'draft' and updated_at = created_at
  and question in (
    'When is the best time to book a newborn session?',
    'What if my baby doesn’t sleep during the session?',
    'What should we wear for our photography session?',
    'Do you photograph maternity and family sessions too?',
    'Where do your photography sessions take place?',
    'How do I book a session with Frames by Stuti?');

insert into public.faq_items (status, sort_order, category, show_on_home, question, answer, published_at)
select 'published', v.sort_order, v.category, true, v.question, v.answer, now()
from (values
  (10, 'newborn', 'When is the best time to book a newborn photoshoot?',
   'Newborn sessions are usually best within the first 1–3 weeks after birth, when babies tend to sleep more and curl naturally into those sweet little poses. I recommend booking during pregnancy so we can plan ahead, but feel free to reach out if your little one has already arrived!'),
  (20, 'maternity', 'When should I book my maternity photoshoot?',
   'Maternity sessions are generally lovely between 28 and 34 weeks of pregnancy, when your bump is beautifully visible and you’re usually still comfortable moving around.'),
  (30, 'family', 'Do you photograph families and milestone celebrations too?',
   'Absolutely! Along with newborn and maternity sessions, I love capturing families, growing little ones, birthdays, cake smashes, and special events.'),
  (40, 'newborn', 'What if my baby doesn’t cooperate during the session?',
   'Please don’t worry! Babies have their own schedules, and that’s completely okay. We’ll allow time for feeding, cuddles, and little breaks so the session feels comfortable and relaxed.'),
  (50, 'family', 'Can parents and siblings be included in the photos?',
   'Of course! I love capturing those beautiful connections between family members. Let me know who’s joining when you enquire so we can plan the session together.'),
  (60, 'general', 'Where are you located?',
   'Frames by Stuti is based in Ottawa, Ontario. Please get in touch to discuss session locations and availability.'),
  (70, 'booking', 'How do I book a photography session?',
   'Simply head to my Contact page and tell me a little about the session you’re dreaming of. I’ll get back to you with the next steps and available options.'),
  (80, 'booking', 'How much does a photoshoot cost?',
   'Pricing depends on the type of session and package you choose. You can explore the available options on my Pricing page, or contact me if you’d like help deciding.')
) as v(sort_order, category, question, answer)
where not exists (select 1 from public.faq_items f where f.question = v.question);
