import { createClient } from "@/lib/supabase/server";
import { CalendarCellData } from "@/lib/types/database";

/**
 * CalendarFetcher - Handles fetching calendar-related data
 */
export class CalendarFetcher {
  /**
   * Get calendar data for a specific month
   * @param year - Year (default: 2025)
   * @param month - Month (default: 12)
   * @returns Calendar data for all days in the month
   */
  static async getCalendarData(
    year: number = 2025,
    month: number = 12
  ): Promise<CalendarCellData[]> {
    const supabase = await createClient();

    // Get current user (may be null if not logged in)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Generate all dates for the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendarData: CalendarCellData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Get declaration count for this date
      const { count: declarationCount } = await supabase
        .from("declarations")
        .select("*", { count: "exact", head: true })
        .eq("publish_date", date);

      // Check if there are any published articles for this date
      const { data: publishedArticles } = await supabase
        .from("articles")
        .select("id")
        .eq("publish_date", date)
        .eq("status", "published")
        .limit(1);

      const hasPublishedArticle = (publishedArticles?.length ?? 0) > 0;

      // User-specific data (only if logged in)
      let isUserDeclared = false;
      let isUserDraft = false;
      let isUserPublished = false;

      if (user) {
        // Check if user has declared for this date
        const { data: userDeclaration } = await supabase
          .from("declarations")
          .select("id")
          .eq("user_id", user.id)
          .eq("publish_date", date)
          .maybeSingle();

        isUserDeclared = !!userDeclaration;

        // Check user's article status for this date
        const { data: userArticle } = await supabase
          .from("articles")
          .select("status")
          .eq("user_id", user.id)
          .eq("publish_date", date)
          .maybeSingle();

        if (userArticle) {
          isUserDraft = userArticle.status === "draft";
          isUserPublished = userArticle.status === "published";
        }
      }

      const isUserArticleExists = isUserDraft || isUserPublished;

      calendarData.push({
        date,
        declarationCount: declarationCount ?? 0,
        hasPublishedArticle,
        isUserDeclared,
        isUserArticleExists,
        isUserDraft,
        isUserPublished,
      });
    }

    return calendarData;
  }
}
