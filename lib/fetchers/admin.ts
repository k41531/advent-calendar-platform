import { createClient } from "@/lib/supabase/server";
import type { TipTapContent } from "@/lib/types/database";
import { getArticleExcerpt } from "@/lib/utils/tiptap";

export interface ArticleWithReactions {
  id: string;
  title: string;
  publish_date: string;
  pen_name: string;
  excerpt: string;
  reaction_count: number;
  reaction_breakdown: {
    [emoji: string]: number;
  };
  status: string;
  created_at: string;
}

export class AdminFetcher {
  /**
   * リアクション数の多い順に記事を取得（管理者用）
   * @param limit 取得件数
   */
  static async getArticlesByReactions(
    limit: number = 50
  ): Promise<ArticleWithReactions[]> {
    const supabase = await createClient();

    // 記事とリアクションを取得
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select(
        `
        id,
        title,
        publish_date,
        content,
        status,
        created_at,
        profiles!articles_user_id_fkey (
          pen_name
        )
      `
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
      return [];
    }

    if (!articles || articles.length === 0) {
      return [];
    }

    // 各記事のリアクション数を取得
    const articlesWithReactions = await Promise.all(
      articles.map(async (article) => {
        const { data: reactions, error: reactionsError } = await supabase
          .from("reactions")
          .select("reaction_type")
          .eq("article_id", article.id);

        if (reactionsError) {
          console.error("Error fetching reactions:", reactionsError);
        }

        // リアクションの内訳を集計
        const reactionBreakdown: { [emoji: string]: number } = {};
        let totalCount = 0;

        if (reactions) {
          reactions.forEach((reaction) => {
            const emoji = reaction.reaction_type;
            reactionBreakdown[emoji] = (reactionBreakdown[emoji] || 0) + 1;
            totalCount++;
          });
        }

        const profiles = article.profiles as
          | { pen_name: string }
          | { pen_name: string }[]
          | null;
        const penName = Array.isArray(profiles)
          ? profiles[0]?.pen_name
          : profiles?.pen_name;

        return {
          id: article.id,
          title: article.title,
          publish_date: article.publish_date,
          pen_name: penName || "匿名",
          excerpt: getArticleExcerpt(article.content as TipTapContent, 100),
          reaction_count: totalCount,
          reaction_breakdown: reactionBreakdown,
          status: article.status,
          created_at: article.created_at,
        };
      })
    );

    // リアクション数でソート（降順）
    const sorted = articlesWithReactions.sort(
      (a, b) => b.reaction_count - a.reaction_count
    );

    // 上限数まで返す
    return sorted.slice(0, limit);
  }

  /**
   * 現在のユーザーが管理者かどうかを確認
   */
  static async isAdmin(): Promise<boolean> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  }
}
