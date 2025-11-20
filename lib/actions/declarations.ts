"use server";

import { createClient } from "@/lib/supabase/server";
import { DeclarationInsert } from "@/lib/types/database";

/**
 * Create a declaration for a specific date (書きます宣言)
 */
export async function createDeclaration(publishDate: string) {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "認証が必要です" };
    }

    // Create declaration
    const insertData: DeclarationInsert = {
      user_id: user.id,
      publish_date: publishDate,
    };

    const { error: insertError, data: declaration } = await supabase
      .from("declarations")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      // Check if it's a duplicate error (user already declared for this date)
      if (insertError.code === "23505") {
        return { success: false, error: "既にこの日に宣言済みです" };
      }
      return { success: false, error: insertError.message };
    }

    return { success: true, data: declaration };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}

/**
 * Check if user has declared for a specific date
 */
export async function checkDeclaration(publishDate: string) {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "認証が必要です" };
    }

    // Check if declaration exists
    const { data: declaration, error } = await supabase
      .from("declarations")
      .select("*")
      .eq("user_id", user.id)
      .eq("publish_date", publishDate)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, isDeclared: !!declaration };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}

/**
 * Get declaration count for a specific date
 */
export async function getDeclarationCount(publishDate: string) {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("declarations")
      .select("*", { count: "exact", head: true })
      .eq("publish_date", publishDate);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}
