import { redirect } from "next/navigation";
import { AdminFetcher } from "@/lib/fetchers/admin";
import { AdminArticleList } from "@/components/admin/admin-article-list";

export default async function AdminPage() {
  // 管理者権限チェック
  const isAdmin = await AdminFetcher.isAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  // リアクション数の多い記事を取得
  const articles = await AdminFetcher.getArticlesByReactions(100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">管理者画面</h1>
        <p className="text-muted-foreground">
          リアクション数の多い記事を確認できます
        </p>
      </div>

      <AdminArticleList articles={articles} />
    </div>
  );
}
