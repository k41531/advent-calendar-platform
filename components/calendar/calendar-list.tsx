"use client";

import { useRouter } from "next/navigation";
import type { CalendarCellData } from "@/lib/types/database";

type CalendarListProps = {
  calendarData: CalendarCellData[];
  hasProfile: boolean;
};

export function CalendarList({ calendarData, hasProfile }: CalendarListProps) {
  const router = useRouter();

  const handleItemClick = (cellData: CalendarCellData) => {
    if (cellData.hasPublishedArticle) {
      router.push(`/calendar/${cellData.date}`);
    }
  };

  return (
    <div className="lg:hidden w-full flex justify-center p-8">
      <div className="flex flex-col gap-2 w-full max-w-2xl">
        {calendarData.slice(0, 25).map((cellData, index) => {
          const day = index + 1;

          return (
            <div
              key={day}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleItemClick(cellData)}
            >
              <span className="text-2xl font-bold w-10 text-center flex-shrink-0">{day}</span>
              <div className="flex-1 min-w-0 space-y-2">
                {cellData.publishedArticles && cellData.publishedArticles.length > 0 ? (
                  cellData.publishedArticles.map((article) => (
                    <div key={article.id} className="text-muted-foreground truncate">
                      {article.title}
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">&nbsp;</div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {cellData.declarationCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ✋ {cellData.declarationCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
