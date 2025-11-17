"use client";

import { cn } from "@/lib/utils";

interface ArticleSidebarProps {
  articles: Array<{
    id: string;
    title: string;
    profiles: {
      pen_name: string;
    };
  }>;
  selectedArticleId: string;
  onArticleSelect: (articleId: string) => void;
  date: string;
}

export function ArticleSidebar({
  articles,
  selectedArticleId,
  onArticleSelect,
  date,
}: ArticleSidebarProps) {
  // Format date for display (YYYY-MM-DD -> M月D日)
  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    return `${parseInt(month)}月${parseInt(day)}日`;
  };

  return (
    <div className="w-80 border-r border-border bg-muted/30 p-[var(--spacing-lg)] overflow-y-auto">
      <div className="mb-[var(--spacing-xl)]">
        <h2 className="text-lg font-bold text-foreground">
          {formatDate(date)}の記事
        </h2>
        <p className="text-sm text-muted-foreground mt-[var(--spacing-xs)]">
          {articles.length}件の記事
        </p>
      </div>

      <div className="space-y-[var(--spacing-sm)]">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => onArticleSelect(article.id)}
            className={cn(
              "w-full text-left p-[var(--spacing-md)] rounded-[var(--radius-lg)] transition-all duration-[var(--transition-base)]",
              "hover:bg-card hover:shadow-sm",
              selectedArticleId === article.id
                ? "bg-card shadow-md border-2 border-accent"
                : "bg-background border-2 border-transparent"
            )}
          >
            <div className="flex items-start gap-[var(--spacing-sm)]">
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-colors duration-[var(--transition-fast)]",
                  selectedArticleId === article.id
                    ? "bg-accent"
                    : "bg-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-sm line-clamp-2 transition-colors duration-[var(--transition-fast)]",
                    selectedArticleId === article.id
                      ? "text-foreground"
                      : "text-foreground/80"
                  )}
                >
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-[var(--spacing-xs)]">
                  by {article.profiles.pen_name}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
