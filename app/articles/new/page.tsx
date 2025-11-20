"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleEditor } from "@/components/article/article-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContentFullScreen, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { ArticlePreview } from "@/components/article/article-preview";
import { saveDraft, publishArticle, getOwnArticleForDate } from "@/lib/actions/articles";
import { createClient } from "@/lib/supabase/client";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export default function NewArticlePage() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [articleId, setArticleId] = useState<string | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("unsaved");
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [penName, setPenName] = useState<string>("");

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("pen_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setPenName(profile.pen_name);
        }
      }
    };

    loadProfile();
  }, []);

  // Load existing draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!date) {
        setIsLoading(false);
        return;
      }

      try {
        const year = new Date().getFullYear();
        const month = 12;
        const day = parseInt(date);
        const publishDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const result = await getOwnArticleForDate(publishDate);

        if (result.success && result.data) {
          setArticleId(result.data.id);
          setTitle(result.data.title);

          // Extract text content from TipTap JSON
          if (result.data.content?.content?.[0]?.content?.[0]?.text) {
            setContent(result.data.content.content[0].content[0].text);
          }

          setSaveStatus("saved");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [date]);

  const handleSave = async () => {
    setIsSavingDraft(true);
    setSaveStatus("saving");
    try {
      // Get current year and month (December 2025)
      const year = new Date().getFullYear();
      const month = 12;
      const day = date ? parseInt(date) : new Date().getDate();
      const publishDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const result = await saveDraft({
        title,
        content,
        publishDate,
        articleId,
      });

      if (result.success) {
        // Save the article ID for future updates
        if (result.data?.id) {
          setArticleId(result.data.id);
        }
        setSaveStatus("saved");
        alert("下書きを保存しました!");
      } else {
        setSaveStatus("error");
        alert(`下書きの保存に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving article:", error);
      setSaveStatus("error");
      alert("下書きの保存に失敗しました");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Get current year and month (December 2025)
      const year = new Date().getFullYear();
      const month = 12;
      const day = date ? parseInt(date) : new Date().getDate();
      const publishDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const result = await publishArticle({
        title,
        content,
        publishDate,
        articleId,
      });

      if (result.success) {
        alert("記事を公開しました!");
      } else {
        alert(`記事の公開に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error publishing article:", error);
      alert("記事の公開に失敗しました");
    } finally {
      setIsPublishing(false);
    }
  };

  // Track changes to mark as unsaved
  useEffect(() => {
    if (!isLoading && saveStatus === "saved") {
      setSaveStatus("unsaved");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  const getStatusDisplay = () => {
    switch (saveStatus) {
      case "saved":
        return <span className="text-green-600 dark:text-green-400">✓ 保存済み</span>;
      case "saving":
        return <span className="text-blue-600 dark:text-blue-400">保存中...</span>;
      case "unsaved":
        return <span className="text-amber-600 dark:text-amber-400">未保存</span>;
      case "error":
        return <span className="text-red-600 dark:text-red-400">エラー</span>;
    }
  };

  // Format date for preview
  const formatDate = (dateStr: string) => {
    const parsedDate = new Date(dateStr);
    return parsedDate.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get publish date for preview
  const getPublishDate = () => {
    const year = new Date().getFullYear();
    const month = 12;
    const day = date ? parseInt(date) : new Date().getDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* タイトルと操作ボタン */}
        <Card className="mb-6">
          <CardHeader className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl">
                  {date ? `12月${date}日の記事を書く` : "新しい記事を書く"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusDisplay()}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!title.trim() || !content.trim()}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  プレビュー
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSavingDraft || !title.trim()}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  下書き保存
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing || !title.trim() || !content.trim()}
                  className="gap-2"
                >
                  {isPublishing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      処理中
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      公開
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="title"
                type="text"
                placeholder="記事のタイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold"
              />
            </div>  
            <ArticleEditor
              content={content}
              onChange={setContent}
            />
          </CardContent>
        </Card>

        {/* プレビューダイアログ */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContentFullScreen>
            <VisuallyHidden>
              <DialogTitle>記事プレビュー</DialogTitle>
            </VisuallyHidden>
            <div className="flex-1 overflow-y-auto bg-background p-8">
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="space-y-4">
                  {/* Article Title */}
                  <h1 className="text-3xl font-bold text-foreground">
                    {title}
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
                      <span className="font-medium text-foreground">{penName || "匿名"}</span>
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
                      <span>{formatDate(getPublishDate())}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Article Content */}
                  <div className="max-w-none">
                    <ArticlePreview content={content} />
                  </div>

                  {/* Article Footer */}
                  <footer className="pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      投稿日時: {formatDate(new Date().toISOString())}
                    </p>
                  </footer>
                </CardContent>
              </Card>
            </div>
          </DialogContentFullScreen>
        </Dialog>
      </div>
    </div>
  );
}
