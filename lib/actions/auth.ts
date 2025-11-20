"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUpWithProfile(formData: {
  email: string;
  password: string;
  penName: string;
}) {
  const supabase = await createClient();

  try {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/protected`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Create profile with pen_name
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, pen_name: formData.penName });

      if (profileError) {
        return { success: false, error: profileError.message };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
