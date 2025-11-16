"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleEditor } from "@/components/article/article-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { saveDraft, publishArticle } from "@/lib/actions/articles";

export default function NewArticlePage() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [articleId, setArticleId] = useState<string | undefined>(undefined);

  const handleSave = async () => {
    setIsSaving(true);
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
        alert("下書きを保存しました!");
      } else {
        alert(`下書きの保存に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving article:", error);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* タイトルと操作ボタン */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {date ? `12月${date}日の記事を書く` : "新しい記事を書く"}
            </CardTitle>
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
