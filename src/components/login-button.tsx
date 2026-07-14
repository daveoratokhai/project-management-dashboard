"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setLoading(false); // otherwise the browser is navigating away
  }

  return (
    <Button onClick={signIn} disabled={loading} className="w-full">
      {loading ? "Redirecting..." : "Sign in with Google"}
    </Button>
  );
}
