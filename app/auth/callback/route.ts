import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
      );
    }

    // Redirect to home - profile check will happen on the client side
    return NextResponse.redirect(`${origin}/`);
  }

  // No code provided, redirect to login with error
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent("認証コードが見つかりませんでした")}`
  );
}
