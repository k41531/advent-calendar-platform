"use server";

import { createClient } from "@/lib/supabase/server";
import { ArticleInsert, ArticleUpdate } from "@/lib/types/database";

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(formData: FormData) {
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

    // Get the file from the form data
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "ファイルが見つかりません" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "画像ファイルのみアップロード可能です" };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: "ファイルサイズは5MB以下にしてください" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("article-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: "アップロードに失敗しました" };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("article-images").getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "予期しないエラーが発生しました",
    };
  }
}

/**
 * Get own article for a specific date
 */
export async function getOwnArticleForDate(publishDate: string) {
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

    // Get draft article for this date
    const { data: article, error } = await supabase
      .from("articles")
      .select("*")
      .eq("user_id", user.id)
      .eq("publish_date", publishDate)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: article };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}

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

/**
 * Get all published articles for a specific date
 */
export async function getPublishedArticlesForDate(publishDate: string) {
  const supabase = await createClient();

  try {
    const { data: articles, error } = await supabase
      .from("articles")
      .select(`
        id,
        user_id,
        publish_date,
        title,
        content,
        status,
        created_at,
        updated_at,
        profiles!articles_user_id_fkey (
          pen_name
        )
      `)
      .eq("publish_date", publishDate)
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: articles || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}

/**
 * Get article by ID (with author information)
 */
export async function getArticleById(articleId: string) {
  const supabase = await createClient();

  try {
    const { data: article, error } = await supabase
      .from("articles")
      .select(`
        id,
        user_id,
        publish_date,
        title,
        content,
        status,
        created_at,
        updated_at,
        profiles!articles_user_id_fkey (
          pen_name
        )
      `)
      .eq("id", articleId)
      .eq("status", "published")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: article };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}
