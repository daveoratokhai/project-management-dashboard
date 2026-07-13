import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StorageAdapter } from "./types";

// Supabase Storage adapter for production. Uses the service role key
// (server-side only, bypasses RLS), so these calls must never run in the
// browser. All attachment routes are `runtime = "nodejs"` and server-only.
export function supabaseStorageAdapter(): StorageAdapter {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "attachments";

  if (!url || !serviceRoleKey) {
    throw new Error(
      "STORAGE_DRIVER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  let client: SupabaseClient | null = null;
  const store = () => {
    client ??= createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
    return client.storage.from(bucket);
  };

  return {
    async put(key, bytes, contentType) {
      const { error } = await store().upload(key, bytes, {
        contentType,
        upsert: false,
      });
      if (error) throw error;
    },
    async get(key) {
      const { data, error } = await store().download(key);
      if (error || !data) {
        throw error ?? new Error(`Object not found: ${key}`);
      }
      return Buffer.from(await data.arrayBuffer());
    },
    async delete(key) {
      // `remove` does not error on a missing key, so deletes stay idempotent.
      const { error } = await store().remove([key]);
      if (error) throw error;
    },
  };
}
