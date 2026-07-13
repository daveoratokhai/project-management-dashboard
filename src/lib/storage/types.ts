// Storage abstraction for attachment bytes.
//
// Attachment metadata lives in the database (see the `Attachment` model);
// the bytes live behind one of these adapters. `key` is the object key,
// which is the `Attachment.storedName` value ("<uuid>-<safe-name>").
//
// Adapters are selected at runtime by STORAGE_DRIVER (see ./index.ts):
// "local" for on-disk dev, "supabase" for Supabase Storage in production.
export interface StorageAdapter {
  // Write bytes under `key`. Overwrites are not expected (keys are unique).
  put(key: string, bytes: Buffer, contentType: string): Promise<void>;
  // Read the bytes for `key`. Throws if the object is missing.
  get(key: string): Promise<Buffer>;
  // Remove the object for `key`. A missing object is not an error.
  delete(key: string): Promise<void>;
}
