import { createClient } from "@/lib/supabase/server";
import type { TipTapContent } from "@/lib/types/database";
import { getArticleExcerpt } from "@/lib/utils/tiptap";

export interface PickupArticle {
  id: string;
  title: string;
  publish_date: string;
  pen_name: string;
  excerpt: string;
}

export class PickupFetcher {
  /**
   * 今日までに公開された記事からランダムに指定件数を取得
   * ペンネームが「管理者」の記事は除外
   */
  static async getRandomPickupArticles(
    limit: number = 3
  ): Promise<PickupArticle[]> {
    const supabase = await createClient();

    // 今日の日付を取得 (YYYY-MM-DD形式)
    const today = new Date().toISOString().split("T")[0];

    // 多めに取得してクライアント側でランダム化
    const fetchLimit = Math.max(limit * 10, 30); // 最低30件、または指定件数の10倍

    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        id,
        title,
        publish_date,
        content,
        profiles!articles_user_id_fkey (
          pen_name
        )
      `
      )
      .eq("status", "published")
      .lte("publish_date", today)
      .neq("profiles.role", "admin") // 管理者の記事を除外
      .order("created_at", { ascending: false })
      .limit(fetchLimit);

    if (error) {
      console.error("Error fetching pickup articles:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // データ構造を整形
    const articles = data.map((article) => {
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
        excerpt: getArticleExcerpt(article.content as TipTapContent, 80),
      };
    });

    // Fisher-Yatesアルゴリズムでランダムにシャッフル
    const shuffled = [...articles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 指定件数だけ返す
    return shuffled.slice(0, limit);
  }
}
