import path from "path";

// Uploaded attachment files live here (gitignored). Served through an API
// route rather than statically, so access can be gated by role later.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
