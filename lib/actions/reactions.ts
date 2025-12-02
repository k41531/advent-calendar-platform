"use server";

import { createClient } from "@/lib/supabase/server";
import { Reaction } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

/**
 * Get reaction counts for a specific article
 */
export async function getReactionCountsForArticle(
  articleId: string
): Promise<{ success: boolean; data?: Record<string, number>; error?: string }> {
  const supabase = await createClient();

  try {
    // Fetch all reactions for this article
    const { data, error } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("article_id", articleId);

    if (error) {
      console.error("Error fetching reaction counts:", error);
      return { success: false, error: "リアクション数の取得に失敗しました" };
    }

    // Count reactions by type
    const counts: Record<string, number> = {};
    data?.forEach((reaction) => {
      counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
    });

    return { success: true, data: counts };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * Get user's reactions for a specific article
 */
export async function getUserReactionsForArticle(
  articleId: string
): Promise<{ success: boolean; data?: Reaction[]; error?: string }> {
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

    // Fetch user's reactions for this article
    const { data, error } = await supabase
      .from("reactions")
      .select("*")
      .eq("article_id", articleId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching reactions:", error);
      return { success: false, error: "リアクションの取得に失敗しました" };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * Toggle a reaction (add if not exists, remove if exists)
 */
export async function toggleReaction(
  articleId: string,
  emoji: string
): Promise<{ success: boolean; action?: "added" | "removed"; error?: string }> {
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

    // Check if reaction already exists
    const { data: existing, error: fetchError } = await supabase
      .from("reactions")
      .select("id")
      .eq("article_id", articleId)
      .eq("user_id", user.id)
      .eq("reaction_type", emoji)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing reaction:", fetchError);
      return { success: false, error: "リアクションの確認に失敗しました" };
    }

    if (existing) {
      // Remove reaction
      const { error: deleteError } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("Error deleting reaction:", deleteError);
        return { success: false, error: "リアクションの削除に失敗しました" };
      }

      // Revalidate the page to update the UI
      revalidatePath(`/calendar/[date]`);

      return { success: true, action: "removed" };
    } else {
      // Add reaction
      const { error: insertError } = await supabase.from("reactions").insert({
        article_id: articleId,
        user_id: user.id,
        reaction_type: emoji,
      });

      if (insertError) {
        console.error("Error adding reaction:", insertError);
        return { success: false, error: "リアクションの追加に失敗しました" };
      }

      // Revalidate the page to update the UI
      revalidatePath(`/calendar/[date]`);

      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
