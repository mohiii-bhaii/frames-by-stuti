import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { openEditor, signOut } from "@/app/admin/auth-actions";
import { FullLogo } from "@/components/logo";
import { pricingCategories, pricingHref } from "@/content/pricing";
import { contactLink, navigation } from "@/content/site";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

const pages = [...navigation, contactLink];

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <FullLogo size="admin" />
      <Suspense fallback={<p className="mt-6 text-neutral-600">Loading…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const { admin, supabase } = await requireAdminPage();
  const { count: unread } = await supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("is_read", false);
  return (
    <>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Website editor</h1>
        <form action={signOut}>
          <button type="submit" className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm">
            Log out
          </button>
        </form>
      </div>
      <p className="mt-1 text-sm text-neutral-600">Signed in as {admin.email}</p>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Edit website</h2>
        <p className="mt-1 text-sm text-neutral-700">
          Opens your real website with a Replace button on every photo. Changes stay private until you press Publish.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {pages.map((page) => (
            <form key={page.href} action={openEditor}>
              <input type="hidden" name="path" value={page.href} />
              <button
                type="submit"
                className={`min-h-12 w-full rounded-lg px-4 text-left font-medium ${
                  page.href === "/" ? "bg-[#2f6fed] text-white" : "border border-neutral-300"
                }`}
              >
                {page.href === "/" ? "Edit website, starting at Home" : `Edit ${page.label}`}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Pricing &amp; Packages</h2>
        <p className="mt-1 text-sm text-neutral-700">
          Opens a pricing page in edit mode. Click any name, price, description or photo to change it. A package with no name stays hidden. Press Publish when you are ready.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[{ href: pricingHref(), label: "Pricing & Packages (overview)" }, ...pricingCategories.map((category) => ({ href: pricingHref(category.slug), label: category.name }))].map((page) => (
            <form key={page.href} action={openEditor}>
              <input type="hidden" name="path" value={page.href} />
              <button type="submit" className="min-h-12 w-full rounded-lg border border-neutral-300 px-4 text-left font-medium">
                Edit {page.label}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">The Journal and FAQ</h2>
        <p className="mt-1 text-sm text-neutral-700">
          Write articles, add photos, preview and publish them, and manage the questions on the FAQ page and home page. Nothing is visible to visitors until you publish it.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link href="/admin/journal" className="flex min-h-12 items-center rounded-lg border border-neutral-300 px-4 font-medium">
            Write and manage articles
          </Link>
          <Link href="/admin/faq" className="flex min-h-12 items-center rounded-lg border border-neutral-300 px-4 font-medium">
            Manage the FAQ
          </Link>
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Inquiries</h2>
        <p className="mt-1 text-sm text-neutral-700">
          Messages sent from the Contact page.
          {unread ? ` You have ${unread} unread.` : ""}
        </p>
        <Link href="/admin/inquiries" className="mt-4 inline-flex min-h-12 items-center rounded-lg border border-neutral-300 px-4 font-medium">
          Open inquiries{unread ? ` (${unread} new)` : ""}
        </Link>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Media library</h2>
        <p className="mt-1 text-sm text-neutral-700">Upload and browse photos. Any photo can be used in more than one place.</p>
        <Link href="/admin/media" className="mt-4 inline-flex min-h-12 items-center rounded-lg border border-neutral-300 px-4 font-medium">
          Open media library
        </Link>
      </section>
    </>
  );
}
