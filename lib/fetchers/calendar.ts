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
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    // Fetch all data in parallel with batch queries
    const [declarationsResult, publishedArticlesResult, userDeclarationsResult, userArticlesResult] =
      await Promise.all([
        // Get all declarations for the month
        supabase
          .from("declarations")
          .select("publish_date")
          .gte("publish_date", startDate)
          .lte("publish_date", endDate),

        // Get all published articles for the month
        supabase
          .from("articles")
          .select("publish_date")
          .eq("status", "published")
          .gte("publish_date", startDate)
          .lte("publish_date", endDate),

        // Get user's declarations (if logged in)
        user
          ? supabase
              .from("declarations")
              .select("publish_date")
              .eq("user_id", user.id)
              .gte("publish_date", startDate)
              .lte("publish_date", endDate)
          : Promise.resolve({ data: null }),

        // Get user's articles (if logged in)
        user
          ? supabase
              .from("articles")
              .select("publish_date, status")
              .eq("user_id", user.id)
              .gte("publish_date", startDate)
              .lte("publish_date", endDate)
          : Promise.resolve({ data: null }),
      ]);

    // Build lookup maps for O(1) access
    const declarationCountMap = new Map<string, number>();
    declarationsResult.data?.forEach((declaration) => {
      const count = declarationCountMap.get(declaration.publish_date) || 0;
      declarationCountMap.set(declaration.publish_date, count + 1);
    });

    const publishedDatesSet = new Set(
      publishedArticlesResult.data?.map((article) => article.publish_date) || []
    );

    const userDeclaredDatesSet = new Set(
      userDeclarationsResult.data?.map((declaration) => declaration.publish_date) || []
    );

    const userArticlesMap = new Map<string, "draft" | "published">();
    userArticlesResult.data?.forEach((article) => {
      userArticlesMap.set(article.publish_date, article.status);
    });

    // Generate calendar data using the lookup maps
    const calendarData: CalendarCellData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const declarationCount = declarationCountMap.get(date) || 0;
      const hasPublishedArticle = publishedDatesSet.has(date);
      const isUserDeclared = userDeclaredDatesSet.has(date);

      const userArticleStatus = userArticlesMap.get(date);
      const isUserDraft = userArticleStatus === "draft";
      const isUserPublished = userArticleStatus === "published";
      const isUserArticleExists = isUserDraft || isUserPublished;

      calendarData.push({
        date,
        declarationCount,
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
