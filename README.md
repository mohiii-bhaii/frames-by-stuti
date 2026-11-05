# Frames by Stuti

The website for Frames by Stuti, built with Next.js 16, TypeScript and Tailwind CSS 4.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

## Before launch

### Replace the photographs

Photos are replaced from the visual editor, with no code changes or redeploys. See [Editing photos](#editing-photos) below. The files in `public/images/` are placeholders, shown for any spot that has nothing published yet. They're listed in `lib/images.ts`.

`npm run placeholders` only creates missing placeholder files and won't overwrite existing ones. Passing `--force` will.

### Replace the placeholder text

Text is edited from the visual editor too. See [Editing text](#editing-text) below. The wording in the code is the original, shown for any text that has nothing published yet.

The original wording lives in `content/site.ts` and `content/texts.ts`: location, service area, email, phone, biography, testimonials, session types, packages, prices and FAQs. Look for `[square brackets]`, `$000` and `hello@example.com`.

A few sections have placeholder copy directly in the page files. Search `app/(site)/` for `[Placeholder.]` to find them.

Social icons stay hidden until a URL is set, either in the editor (**Text on this page**, then Contact details) or in `social` in `content/site.ts`.

### The contact form and inquiries

The Contact page has a long-form inquiry: first and last name, phone, email, session type (Newborn, Maternity, Cake Smash, Family / Lifestyle, Milestones, Engagement / Couple, Portraits, Seniors / Graduation, Events, Other), a due date that only appears for Maternity and Newborn, location preference and city, the weekdays that work best (at least one), a required message, and how they heard about you. Every label, hint and option is editable text in the visual editor. The home page cards open this form with the matching session type chosen, using the card's current name (so a card renamed "Cake Smash" selects Cake Smash).

The form validates in the browser and again on the server, then saves the inquiry in Supabase (the `inquiries` table). Each submission carries a one-time token, so a double tap or a retry is saved once. Only the signed-in owner can read them: log in at `/admin` and open **Inquiries**. Visitors can only add an inquiry, through the `submit_inquiry()` database function, which also limits how fast inquiries can arrive (3 per email and 40 in total per hour). Spam is further filtered by a hidden field and a minimum fill-in time.

Run `supabase/migrations/20261105000000_inquiries.sql`, then `20261106000000_inquiries_long_form.sql` and `20261106010000_retire_short_inquiry_function.sql`, once each, in that order (they are already applied to the live project).

**Email notifications** use [Resend](https://resend.com) (free for this volume). They stay off until these environment variables exist in Vercel (Project, Settings, Environment Variables, then redeploy):

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | An API key from Resend (**API Keys**, then **Create API Key**, "Sending access"). Mark it **Sensitive** in Vercel. Never put it in the code. |
| `INQUIRY_NOTIFY_EMAIL` | The address that receives each inquiry. |
| `INQUIRY_FROM_EMAIL` | Optional. Leave it out to use Resend's test sender, `onboarding@resend.dev`. |

The test sender can only deliver to the email address the Resend account was created with, so sign up to Resend with the address you want the notifications at. To send from your own domain instead, verify the domain in Resend and set `INQUIRY_FROM_EMAIL` to something like `Frames by Stuti <hello@yourdomain.com>`. Do not use a Gmail address as the sender: Gmail does not allow other services to send as it. Each email's Reply-To is the customer, so replying answers them directly.

Every inquiry is saved first. Then the email is attempted, and the result is stored with the inquiry (`email_status`: `sent`, `failed`, `not_configured`, with the reason in `email_error`) and shown as a badge on each inquiry in **Inquiries**. A missing setting or a refusal is also logged on the server (Vercel, Logs: search "Inquiry saved"). A failed or missing email never hides the inquiry and never changes what the visitor sees. Run `supabase/migrations/20261107010000_inquiry_email_status.sql` once (already applied to the live project).

You can also forward each inquiry as JSON to any webhook service:

```bash
CONTACT_WEBHOOK_URL=https://your-service.example/webhook
```

## Editing photos

### For Stuti: replace a photo from your phone

1. Open **yoursite.com/admin/login** on your phone and log in with your email address and password.
2. Tap **Edit website, starting at Home**. You'll see your real website with a **Replace photo** button on every photo, and a toolbar at the bottom of the screen.
3. Scroll to the photo you want to change and tap **Replace photo**. A panel slides up from the bottom.
4. Tap **Upload photo** and pick a photo from your gallery, or tap **Media library** to reuse one you've uploaded before. Big camera files and iPhone HEIC photos are fine. They're resized for the web automatically, and the original on your phone isn't changed.
5. Tap or drag on the photo to choose the part that must stay in view. Use **Zoom** if you want a tighter crop. **How it will look** shows the exact shape the page uses.
6. Write a short **description** of the photo, for example "A couple laughing in a wheat field at sunset". Screen readers read it aloud.
7. Tap **Done**. The page now shows your new photo, but only to you.
8. To change photos on other pages, use the page menu in the toolbar. Your changes are kept as you move between pages.
9. Tap **Save draft** to keep your changes without making them live, or **Publish**, then **Publish now**, to put them on the live website. A message confirms when it worked.

Other things you can do:

- **Preview** in the toolbar hides the editing buttons so you see the page as visitors will after publishing.
- **More > Photos on this page** lists every photo on the page, including ones hidden at your screen size.
- **More > Cancel unsaved changes** throws away changes you haven't saved.
- In a photo's panel: **Restore the previously published photo** brings back the last live photo as a draft (then press Publish), **Discard saved draft** drops a draft you don't want, and **Go back to the original placeholder** does what it says.
- The logo is a fixed brand file (`public/brand/logo.png` for cream backgrounds, `logo-light.png` for the dark footer), built from `scripts/brand/frames-by-stuti-logo.png` with `npm run logo`. It has no Replace button in the editor. To change it, replace that source file and run `npm run logo`.
- **More > Exit editor** returns to the dashboard. The live site never shows editing buttons to visitors.

## Editing text

Every word on the website can be edited from the same visual editor, on the real pages.

1. Log in at `/admin` and open **Edit website**.
2. Hover over any text (or tap it on a phone). It outlines in blue; click it to open the text panel. Buttons and links inside text can be edited without following them.
3. Type the new wording. The page updates as you type, in exactly the same font, size, colour and animation. Only the words change.
4. **Save draft** keeps it private; **Cancel** throws the change away. **Use original wording** goes back to what the site shipped with.
5. **Publish** (in the bottom bar) shows a list of every photo and text change and makes them live together.

Some text has nothing to tap, such as form placeholders, the answers inside closed FAQs and package details. Open **More > Text on this page**, search, and pick it from the list. Social links and the email address are edited the same way (Contact details). A social link that is emptied is hidden.

Long text: biographies and paragraph-length text can be up to 30,000 characters; titles and button labels stay at 1,500 (`maxTextLength` in `content/texts.ts`). The database ceiling was raised to 30,000 by `supabase/migrations/20261107000000_site_texts_long_text.sql` (already applied to the live project).

Testimonials: the Testimonials band (with its photo) is shown only once at least one testimonial has both a real review and a client name; with none, nothing of it is drawn. Add them in the editor on the Home page (**More > Text on this page**, then "Testimonial 1 · The review" and "... Client name"; there is room for three), and publish. Empty, one-sided or [bracketed] testimonials are ignored. With one testimonial the arrows are hidden; with two or more they appear. The editor always shows the band so testimonials can be added.

How it works: `content/texts.ts` lists every editable text with its original wording and a key such as `home.tagline`. Pages render `<T id="home.tagline" />` (`components/editable-text.tsx`), which keeps the element and classes the page gives it. Edits live in one table, `site_texts`, one row per key. Visitors read only published text through `get_published_texts()`, cached with the pages like photos. To make another piece of text editable, add it to `content/texts.ts` and use `<T>` where it appears.

### How it works

- **Login** is Supabase Auth with email and password. Only accounts listed in the `admin_users` table can edit. Every admin page and every Server Action re-checks the session and the allowlist on the server.
- **Edit mode** uses Next.js Draft Mode, which is only switched on after that check. The editor's code is only downloaded in edit mode, so public visitors get the same static pages as before.
- **Photos** upload straight from the browser to the Supabase Storage bucket `site-photos`, each into its own new folder, so nothing is ever overwritten. Storage policies only allow admins to upload, and nobody can overwrite or delete files through the API.
- **Drafts and published versions** are rows in `image_versions`. Every save creates a new version, and `image_slots` points each spot at its current draft and published version. Publishing moves all drafts live in one database transaction.
- **The public site** reads only published photos through the `get_published_images()` database function. Results are cached with the prerendered pages, and publishing expires that cache, so changes appear on the next visit without a redeploy.
- Each spot has a permanent id, such as `home-oval` or `gallery-07`, listed in `lib/images.ts`. (`logo-wordmark` and `logo-badge` are older editor spots for the logo and are no longer used.)

### Set up Supabase

1. Create a Supabase project, or use the existing one.
2. Run `supabase/migrations/20261103000000_site_images.sql` and then `supabase/migrations/20261104000000_site_texts.sql` in the SQL editor, or with `supabase db push`.
3. Under **Authentication > Sign In / Providers**, turn off **Allow new users to sign up**.
4. Under **Authentication > Users**, choose **Add user** and create Stuti's account with her email address and a strong password.
5. Put her email address into `supabase/add-admin.sql` and run it in the SQL editor.
6. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key from **Project Settings > API Keys**. Add the same two variables to your hosting provider, then redeploy once.

No secret or service-role key is needed. The publishable key is safe in the browser because every write is checked by Row Level Security.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/(site)/` | Pages: home, about, portfolio, services, contact |
| `app/admin/` | Login, dashboard, media library and the editor's Server Actions |
| `components/editor/` | The visual editor: toolbar, photo panel, crop tool, media library, uploads |
| `components/editable-image.tsx` | Every photo on the site, with its Replace button for admins |
| `lib/auth.ts` | Admin session checks |
| `lib/site-images.ts` | Cached loading of published photos |
| `proxy.ts` | Session refresh and login redirect for `/admin` |
| `supabase/` | Database migration and admin allowlist script |
| `components/` | Header and menu, footer, gallery, FAQ, packages, form, line art |
| `content/site.ts` | Editable business details and copy |
| `lib/images.ts` | Image slot registry and placeholders |
| `lib/inquiry.ts` | Contact form validation |
| `scripts/generate-placeholders.mjs` | Generates the placeholder images |
