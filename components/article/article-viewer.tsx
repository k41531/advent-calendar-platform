import { ArticlePreview } from "./article-preview";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ArticleViewerProps {
  article: {
    id: string;
    title: string;
    content: any; // Can be TipTap JSON or HTML string
    publish_date: string;
    created_at: string;
    profiles: {
      pen_name: string;
    };
  };
}

export function ArticleViewer({ article }: ArticleViewerProps) {
  // Content should be HTML string from the editor
  const htmlContent = article.content?.content?.[0]?.content?.[0]?.text || "";

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-4">
          {/* Article Title */}
          <h1 className="text-3xl font-bold text-foreground">
            {article.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium text-foreground">{article.profiles.pen_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(article.publish_date)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Article Content */}
          <div className="max-w-none">
            <ArticlePreview content={htmlContent} />
          </div>

          {/* Article Footer */}
          <footer className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              投稿日時: {formatDate(article.created_at)}
            </p>
          </footer>
        </CardContent>
      </Card>
    </div>
  );
}
