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

    if (data.user) {
      // Check if profile already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is expected for new users
        console.error("Error checking profile:", profileError);
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent("プロフィールの確認中にエラーが発生しました")}`
        );
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        // Get pen_name from localStorage (will be handled client-side)
        // We need to redirect to a client-side page to get the pen_name
        return NextResponse.redirect(`${origin}/auth/complete-profile`);
      }
    }

    // Profile exists or was created successfully, redirect to home
    return NextResponse.redirect(`${origin}/`);
  }

  // No code provided, redirect to login with error
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent("認証コードが見つかりませんでした")}`
  );
}
