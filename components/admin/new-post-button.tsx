"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost } from "@/app/admin/content-actions";

export function NewPostButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const result = await createPost();
          if (!result.ok) {
            setBusy(false);
            return setError(result.error);
          }
          router.push(`/admin/journal/${result.data.id}`);
        }}
        className="min-h-11 rounded-lg bg-[#2f6fed] px-4 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Starting…" : "Write a new article"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
