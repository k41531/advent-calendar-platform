"use client";

import { useState } from "react";
import { ArticleEditor } from "@/components/article/article-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // ここにSupabaseへの保存処理を実装
      console.log("Saving article:", { title, content });

      // 仮の保存処理
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("記事を保存しました!");
    } catch (error) {
      console.error("Error saving article:", error);
      alert("記事の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // ここにSupabaseへの公開処理を実装
      console.log("Publishing article:", { title, content });

      // 仮の公開処理
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("記事を公開しました!");
    } catch (error) {
      console.error("Error publishing article:", error);
      alert("記事の公開に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* タイトルと操作ボタン */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>新しい記事を書く</CardTitle>
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
