import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

let client: ReturnType<typeof createBrowserClient> | undefined;

/** The signed-in admin's client in the browser, used for direct uploads to Storage. */
export function getBrowserClient() {
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
