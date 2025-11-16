"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleEditor } from "@/components/article/article-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { saveDraft, publishArticle, getOwnArticleForDate } from "@/lib/actions/articles";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export default function NewArticlePage() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [articleId, setArticleId] = useState<string | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("unsaved");
  const [isLoading, setIsLoading] = useState(true);

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
    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
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
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* タイトルと操作ボタン */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {date ? `12月${date}日の記事を書く` : "新しい記事を書く"}
              </CardTitle>
              <div className="text-sm font-normal">{getStatusDisplay()}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                type="text"
                placeholder="記事のタイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
              >
                下書き保存
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isSaving || !title.trim() || !content.trim()}
              >
                {isSaving ? "処理中..." : "公開"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* エディターとプレビューを左右に配置 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* エディターエリア */}
          <Card>
            <CardHeader>
              <CardTitle>編集</CardTitle>
            </CardHeader>
            <CardContent>
              <ArticleEditor
                content={content}
                onChange={setContent}
                placeholder="記事の内容を書いてください..."
              />
            </CardContent>
          </Card>

          {/* プレビューエリア */}
          <Card>
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">
                {title || "タイトル未設定"}
              </h1>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: content || "<p>内容がありません</p>" }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
