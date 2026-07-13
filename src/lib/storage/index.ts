import { localStorageAdapter } from "./local";
import { supabaseStorageAdapter } from "./supabase";
import type { StorageAdapter } from "./types";

export type { StorageAdapter } from "./types";

// Chooses the storage backend from STORAGE_DRIVER:
//   "local"    -> on-disk ./uploads (default; local development)
//   "supabase" -> Supabase Storage (production)
// The adapter is built once and reused for the lifetime of the process.
let cached: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (cached) return cached;
  const driver = process.env.STORAGE_DRIVER ?? "local";
  cached = driver === "supabase" ? supabaseStorageAdapter() : localStorageAdapter();
  return cached;
}
