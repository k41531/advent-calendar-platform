import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { CalendarCell } from "@/components/calendar/calendar-cell";
import { createClient } from "@/lib/supabase/server";
import { CalendarFetcher } from "@/lib/fetchers/calendar";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch calendar data
  const calendarData = await CalendarFetcher.getCalendarData(2025, 12);

  // Calculate days until Christmas
  const christmas = new Date("2025-12-25");
  const today = new Date();
  const daysUntilChristmas = Math.ceil(
    (christmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Random tips
  const tips = [
    "カレンダーのマスをクリックして記事を書き始めましょう",
    "事前に「書きます宣言」をして参加意思を表明できます",
    "12月1日から25日まで、毎日1つの記事を公開できます",
    "他の人の記事も読んで、知識を共有しましょう",
    "宣言数が多い日ほど、たくさんの人が書く予定です",
    "下書きは何度でも編集できます。公開前に見直しましょう",
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <main className="min-h-screen flex">
      <div className="absolute top-4 right-4 z-10">
        <LogoutButton />
      </div>

      {/* 左側: 説明エリア */}
      <div className="w-1/3 flex flex-col justify-center p-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-xl w-full space-y-8">
            {/* Tips - 中央配置 */}
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {randomTip}
              </p>
            </div>

            {/* クリスマスまでのカウントダウン - 控えめ */}
            <div className="text-center text-sm text-muted-foreground">
              🎄 クリスマスまであと {daysUntilChristmas} 日
            </div>
          </div>
        </div>

        {/* アイコンの説明 - 下部 */}
        <div className="space-y-4 bg-card p-6 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✋</span>
              <div>
                <div className="font-medium">書きます宣言</div>
                <div className="text-sm text-muted-foreground">
                  その日の記事を書く意思を表明できます
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🖋️</span>
              <div>
                <div className="font-medium">その日を書く</div>
                <div className="text-sm text-muted-foreground">
                  選択した日付の記事を執筆・公開できます
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右側: カレンダーグリッド */}
      <div className="w-2/3 flex items-center justify-center p-8 bg-muted/30">
        <div className="grid grid-cols-5 gap-4 w-full max-w-4xl">
          {calendarData.slice(0, 25).map((cellData, index) => {
            const day = index + 1;
            return (
              <CalendarCell
                key={day}
                day={day}
                date={cellData.date}
                isUserDraft={cellData.isUserDraft}
                isUserPublished={cellData.isUserPublished}
                hasPublishedArticle={cellData.hasPublishedArticle}
                declarationCount={cellData.declarationCount}
                isUserDeclared={cellData.isUserDeclared}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
