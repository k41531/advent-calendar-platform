"use server";

import { createClient } from "@/lib/supabase/server";
import { ArticleInsert, ArticleUpdate } from "@/lib/types/database";

/**
 * Save article as draft
 */
export async function saveDraft(data: {
  title: string;
  content: string;
  publishDate: string; // YYYY-MM-DD format
  articleId?: string; // Optional: for updating existing draft
}) {
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

    // Convert content to TipTap JSON format
    // For now, we'll store as simple text wrapped in TipTap structure
    const tiptapContent = {
      type: "doc" as const,
      content: [
        {
          type: "paragraph",
          content: data.content
            ? [
                {
                  type: "text",
                  text: data.content,
                },
              ]
            : undefined,
        },
      ],
    };

    if (data.articleId) {
      // Update existing draft
      const updateData: ArticleUpdate = {
        title: data.title,
        content: tiptapContent,
        publish_date: data.publishDate,
        status: "draft",
      };

      const { error: updateError, data: article } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", data.articleId)
        .eq("user_id", user.id) // Ensure user owns the article
        .select()
        .single();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, data: article };
    } else {
      // Create new draft
      const insertData: ArticleInsert = {
        user_id: user.id,
        title: data.title,
        content: tiptapContent,
        publish_date: data.publishDate,
        status: "draft",
      };

      const { error: insertError, data: article } = await supabase
        .from("articles")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      return { success: true, data: article };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}

/**
 * Publish article
 */
export async function publishArticle(data: {
  title: string;
  content: string;
  publishDate: string; // YYYY-MM-DD format
  articleId?: string; // Optional: for publishing existing draft
}) {
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

    // Convert content to TipTap JSON format
    const tiptapContent = {
      type: "doc" as const,
      content: [
        {
          type: "paragraph",
          content: data.content
            ? [
                {
                  type: "text",
                  text: data.content,
                },
              ]
            : undefined,
        },
      ],
    };

    if (data.articleId) {
      // Update and publish existing article
      const updateData: ArticleUpdate = {
        title: data.title,
        content: tiptapContent,
        publish_date: data.publishDate,
        status: "published",
      };

      const { error: updateError, data: article } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", data.articleId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, data: article };
    } else {
      // Create and publish new article
      const insertData: ArticleInsert = {
        user_id: user.id,
        title: data.title,
        content: tiptapContent,
        publish_date: data.publishDate,
        status: "published",
      };

      const { error: insertError, data: article } = await supabase
        .from("articles")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      return { success: true, data: article };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}
