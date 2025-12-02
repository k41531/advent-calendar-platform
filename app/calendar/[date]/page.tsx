"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArticleSidebar } from "@/components/article/article-sidebar";
import { ArticleViewer } from "@/components/article/article-viewer";
import { getPublishedArticlesForDate } from "@/lib/actions/articles";
import { getReactionCountsForArticle } from "@/lib/actions/reactions";
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
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch articles for the date
  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);

      const result = await getPublishedArticlesForDate(date);

      if (result.success && result.data) {
        const mappedArticles = result.data.map((article: any) => ({
          ...article,
          profiles: article.profiles || { pen_name: '' }
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

  // Fetch reaction counts when selected article changes
  useEffect(() => {
    async function fetchReactionCounts() {
      if (!selectedArticleId) return;

      const result = await getReactionCountsForArticle(selectedArticleId);
      if (result.success && result.data) {
        setReactionCounts(result.data);
      } else {
        setReactionCounts({});
      }
    }

    fetchReactionCounts();
  }, [selectedArticleId]);

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
    <div className="h-screen flex flex-col bg-background pt-20 xl:pt-0">
      {/* Main Content: Sidebar + Article Viewer */}
      <div className="flex flex-1 overflow-hidden relative">
        {articles.length > 1 && (
          <>
            {/* モバイル用トグルボタン */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="fixed left-4 bottom-4 z-30 md:hidden bg-accent text-accent-foreground rounded-full p-4 shadow-lg hover:bg-accent/90 transition-colors duration-[var(--transition-fast)]"
              aria-label="記事一覧を表示"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <ArticleSidebar
              articles={articles}
              selectedArticleId={selectedArticleId || ""}
              onArticleSelect={handleArticleSelect}
              date={date}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </>
        )}
        <div
          className={`flex-1 overflow-y-auto transition-opacity duration-300 ease-in-out ${
        isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {selectedArticle && (
        <ArticleViewer key={selectedArticle.id} article={selectedArticle} reactionCounts={reactionCounts} />
          )}
        </div>
      </div>
    </div>
  );
}
