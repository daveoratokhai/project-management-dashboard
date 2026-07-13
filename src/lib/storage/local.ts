import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";
import type { StorageAdapter } from "./types";

// On-disk adapter used for local development. Bytes are written under
// ./uploads (gitignored). This does NOT work on serverless hosts with an
// ephemeral filesystem (e.g. Vercel); use the Supabase adapter there.
export function localStorageAdapter(): StorageAdapter {
  return {
    async put(key, bytes) {
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, key), bytes);
    },
    async get(key) {
      return readFile(path.join(UPLOAD_DIR, key));
    },
    async delete(key) {
      await unlink(path.join(UPLOAD_DIR, key)).catch(() => {
        // Already gone; deleting is idempotent.
      });
    },
  };
}
