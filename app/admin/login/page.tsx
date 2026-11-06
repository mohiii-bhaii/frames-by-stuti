import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/app/admin/login/login-form";
import { FullLogo } from "@/components/logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-5 py-12">
      <FullLogo size="admin" />
      <h1 className="mt-2 text-xl font-semibold">Log in to edit your website</h1>
      {isSupabaseConfigured ? (
        <LoginForm />
      ) : (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          The editor isn&apos;t connected to Supabase yet. Add the values from <code>.env.example</code> to{" "}
          <code>.env.local</code> and restart the server.
        </p>
      )}
      <Link href="/" className="mt-8 text-sm text-neutral-600 underline">
        Back to the website
      </Link>
    </main>
  );
}
