"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArticleSidebar } from "@/components/article/article-sidebar";
import { ArticleViewer } from "@/components/article/article-viewer";
import { getPublishedArticlesForDate } from "@/lib/actions/articles";
import { TipTapContent } from "@/lib/types/database";

interface ArticleWithAuthor {
  id: string;
  user_id: string;
  publish_date: string;
  title: string;
  content: TipTapContent;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    pen_name: string;
  };
}

export default function CalendarDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = params.date as string;
  const articleIdParam = searchParams.get("article");

  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch articles for the date
  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);

      const result = await getPublishedArticlesForDate(date);

      if (result.success && result.data) {
        const mappedArticles = result.data.map((article: any) => ({
          ...article,
          profiles: article.profiles[0] || { pen_name: '' }
        }));
        setArticles(mappedArticles as ArticleWithAuthor[]);
      } else {
        setError(result.error || "記事の取得に失敗しました");
      }

      setLoading(false);
    }

    fetchArticles();
  }, [date]);

  // Sync selected article with URL parameter
  useEffect(() => {
    if (articles.length > 0) {
      if (articleIdParam && articles.some((a) => a.id === articleIdParam)) {
        setSelectedArticleId(articleIdParam);
      } else if (!selectedArticleId) {
        setSelectedArticleId(articles[0].id);
      }
    }
  }, [articles, articleIdParam]);

  // Handle article selection with transition
  const handleArticleSelect = (articleId: string) => {
    // Start fade out
    setIsTransitioning(true);

    // After fade out, update article and fade in
    setTimeout(() => {
      setSelectedArticleId(articleId);
      router.push(`/calendar/${date}?article=${articleId}`, { scroll: false });
      setIsTransitioning(false);
    }, 150); // Half of the 300ms transition duration
  };

  // Get selected article
  const selectedArticle = articles.find((a) => a.id === selectedArticleId);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-[var(--spacing-lg)]"></div>
          <p className="text-muted-foreground">記事を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-[var(--spacing-lg)]">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-[var(--spacing-lg)] py-[var(--spacing-md)] bg-primary text-primary-foreground rounded-[var(--radius-lg)] hover:bg-primary/90 transition-colors duration-[var(--transition-fast)]"
          >
            カレンダーに戻る
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-[var(--spacing-lg)]">この日付には記事がありません</p>
          <button
            onClick={() => router.push("/")}
            className="px-[var(--spacing-lg)] py-[var(--spacing-md)] bg-primary text-primary-foreground rounded-[var(--radius-lg)] hover:bg-primary/90 transition-colors duration-[var(--transition-fast)]"
          >
            カレンダーに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-[var(--spacing-xl)] py-[var(--spacing-lg)] flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-[var(--spacing-sm)] text-muted-foreground hover:text-foreground transition-colors duration-[var(--transition-fast)]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">カレンダーに戻る</span>
        </button>
      </header>

      {/* Main Content: Sidebar + Article Viewer */}
      <div className="flex flex-1 overflow-hidden">
        <ArticleSidebar
          articles={articles}
          selectedArticleId={selectedArticleId || ""}
          onArticleSelect={handleArticleSelect}
          date={date}
        />
        <div
          className={`flex-1 transition-opacity duration-300 ease-in-out ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {selectedArticle && (
            <ArticleViewer key={selectedArticle.id} article={selectedArticle} />
          )}
        </div>
      </div>
    </div>
  );
}
