"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth";

/** Marks an inquiry as read (or unread again). Only the signed-in owner can do this. */
export async function setInquiryRead(formData: FormData) {
  const { supabase } = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "true";
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const { error } = await supabase.from("inquiries").update({ is_read: read }).eq("id", id);
  if (error) console.error("Could not update the inquiry:", error.message);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}
