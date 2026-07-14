import OpenAI, { toFile } from "openai";

// Speech-to-text for voice notes. Cheap and fast, runs inside the webhook.
const TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe";

// Sanity cap on audio we'll pull from Twilio. WhatsApp voice notes are small;
// this guards against a pathological download, not a real product limit.
const MAX_AUDIO_BYTES = 16 * 1024 * 1024;

// Best-effort file extension for the OpenAI upload, derived from the MIME type
// Twilio reports. WhatsApp voice notes are audio/ogg (opus).
function extForContentType(contentType: string): string {
  const t = contentType.toLowerCase();
  if (t.includes("ogg") || t.includes("opus")) return "ogg";
  if (t.includes("mpeg") || t.includes("mp3")) return "mp3";
  if (t.includes("mp4") || t.includes("m4a") || t.includes("aac")) return "m4a";
  if (t.includes("wav")) return "wav";
  if (t.includes("webm")) return "webm";
  return "ogg";
}

// Fetches a Twilio-hosted media file and transcribes it with OpenAI.
//
// Twilio media URLs require HTTP Basic auth (AccountSid : AuthToken), then
// 302-redirect to a signed CDN URL. `fetch` follows the redirect and drops the
// Authorization header cross-origin, which is what we want (the CDN URL is
// pre-signed). Throws on any failure so the caller can reply gracefully.
export async function transcribeTwilioAudio(
  mediaUrl: string,
  contentType: string,
  auth: { accountSid: string; authToken: string },
): Promise<string> {
  const basic =
    "Basic " +
    Buffer.from(`${auth.accountSid}:${auth.authToken}`).toString("base64");

  const res = await fetch(mediaUrl, { headers: { Authorization: basic } });
  if (!res.ok) {
    throw new Error(`Twilio media fetch failed: ${res.status}`);
  }

  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length === 0) throw new Error("Empty media file");
  if (bytes.length > MAX_AUDIO_BYTES) throw new Error("Media file too large");

  const file = await toFile(bytes, `voice.${extForContentType(contentType)}`, {
    type: contentType || "audio/ogg",
  });

  const client = new OpenAI();
  const result = await client.audio.transcriptions.create({
    file,
    model: TRANSCRIBE_MODEL,
  });

  return (result.text ?? "").trim();
}
