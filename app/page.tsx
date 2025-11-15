import Link from "next/link";
import { redirect } from "next/navigation";
import { DeployButton } from "@/components/deploy-button";
import { CalendarCell } from "@/components/calendar/calendar-cell";
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
    <main className="min-h-screen flex">
      <div className="absolute top-4 right-4 z-10">
        <DeployButton />
      </div>

      {/* 左側: 説明エリア */}
      <div className="w-1/3 flex flex-col items-center justify-center p-8">
        <div className="max-w-xl w-full space-y-8">
          <h1 className="text-4xl font-bold">アドベントカレンダープラットフォーム</h1>
          <p className="text-lg text-muted-foreground">
            アドベントカレンダーの記事を作成・共有できるプラットフォームです
          </p>
          <div className="flex gap-4">
            <Link
              href="/articles/new"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              記事を書く
            </Link>
          </div>
        </div>
      </div>

      {/* 右側: カレンダーグリッド */}
      <div className="w-2/3 flex items-center justify-center p-8 bg-muted/30">
        <div className="grid grid-cols-5 gap-4 w-full max-w-4xl">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((day) => (
            <CalendarCell key={day} day={day} />
          ))}
        </div>
      </div>
    </main>
  );
}
