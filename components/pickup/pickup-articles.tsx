import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PickupFetcher, PickupArticle } from "@/lib/fetchers/pickup";
import { formatJapaneseDate } from "@/lib/date-utils";

export async function PickupArticles() {
  const articles = await PickupFetcher.getRandomPickupArticles(3);

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-primary">
        📝 ピックアップ記事
      </h2>
      <div className="space-y-2">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/calendar/${article.publish_date}?article=${article.id}`}
            className="block transition-transform hover:scale-[1.02]"
          >
            <Card className="border-2 hover:border-primary hover:shadow-md transition-all">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm line-clamp-2">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {article.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{article.pen_name}</span>
                  <span>{formatJapaneseDate(article.publish_date)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
