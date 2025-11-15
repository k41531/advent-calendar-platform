import Link from "next/link";
import { redirect } from "next/navigation";
import { DeployButton } from "@/components/deploy-button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <DeployButton />
      </div>
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold">アドベントカレンダープラットフォーム</h1>
        <p className="text-lg text-muted-foreground">
          アドベントカレンダーの記事を作成・共有できるプラットフォームです
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/articles/new"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            記事を書く
          </Link>
        </div>
      </div>
    </main>
  );
}
