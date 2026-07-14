import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { ingestNote } from "@/lib/intake/ingest";

export const runtime = "nodejs";

// Reply to the sender with TwiML (a plain XML message element). Returning this
// as the webhook response sends `text` back into the same WhatsApp thread.
function twiml(text: string): NextResponse {
  const res = new twilio.twiml.MessagingResponse();
  res.message(text);
  return new NextResponse(res.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// The public URL Twilio signed the request against. Must match the webhook URL
// configured in the Twilio console exactly, or signature validation fails.
function requestUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "";
  return `${proto}://${host}/api/intake/whatsapp/webhook`;
}

// POST /api/intake/whatsapp/webhook - Twilio WhatsApp inbound handler.
// Twilio sends application/x-www-form-urlencoded with fields like Body, From,
// NumMedia. We verify the X-Twilio-Signature, triage the note into a task, and
// reply in-thread to confirm.
export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    // Misconfiguration: refuse rather than accept unauthenticated posts.
    console.error("TWILIO_AUTH_TOKEN is not set; rejecting webhook");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") params[key] = value;
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  const valid = twilio.validateRequest(
    authToken,
    signature,
    requestUrl(req),
    params,
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const from = params.From ?? "";
  const body = (params.Body ?? "").trim();
  const numMedia = parseInt(params.NumMedia ?? "0", 10) || 0;

  // Voice notes and other media are a later phase; ask for text for now.
  if (numMedia > 0 && !body) {
    return twiml(
      "Thanks! Voice notes and attachments aren't supported yet, please send your note as text and I'll add it as a task.",
    );
  }
  if (!body) {
    return twiml("Send a short note and I'll add it as a task to the right project.");
  }

  try {
    const result = await ingestNote({ channel: "whatsapp", from, body });
    const where = result.routed
      ? `to ${result.projectName}`
      : `to ${result.projectName} (couldn't tell which project, please review)`;
    return twiml(`Added "${result.taskTitle}" ${where}. Marked unreviewed.`);
  } catch (err) {
    console.error("Intake failed:", err);
    return twiml(
      "Sorry, something went wrong adding that just now. Please try again in a moment.",
    );
  }
}
