"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ArticleWithReactions } from "@/lib/fetchers/admin";

interface AdminArticleListProps {
  articles: ArticleWithReactions[];
}

export function AdminArticleList({ articles }: AdminArticleListProps) {
  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          公開済みの記事がありません
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        全 {articles.length} 件の記事
      </div>

      {articles.map((article, index) => (
        <Card key={article.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    #{index + 1}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {article.publish_date}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {article.pen_name}
                  </span>
                </div>
                <CardTitle className="text-xl">
                  <Link
                    href={`/calendar/${article.publish_date}`}
                    className="hover:underline"
                  >
                    {article.title}
                  </Link>
                </CardTitle>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {article.reaction_count}
                </div>
                <div className="text-xs text-muted-foreground">
                  リアクション
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {article.excerpt}
            </p>
            {article.reaction_count > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(article.reaction_breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emoji, count]) => (
                    <Badge
                      key={emoji}
                      variant="secondary"
                      className="text-sm flex items-center gap-1"
                    >
                      <span>{emoji}</span>
                      <span className="font-semibold">{count}</span>
                    </Badge>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
