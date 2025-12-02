import { redirect } from "next/navigation";
import { CalendarCell } from "@/components/calendar/calendar-cell";
import { createClient } from "@/lib/supabase/server";
import { CalendarFetcher } from "@/lib/fetchers/calendar";
import type { CalendarCellData } from "@/lib/types/database";

type CalendarSectionProps = {
  calendarData: CalendarCellData[];
  hasProfile: boolean;
};

function CalendarGrid({ calendarData, hasProfile }: CalendarSectionProps) {
  return (
    <div className="hidden lg:flex w-2/3 items-center justify-center p-8 bg-muted/30">
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
              hasProfile={hasProfile}
            />
          );
        })}
      </div>
    </div>
  );
}

function CalendarList({ calendarData, hasProfile }: CalendarSectionProps) {
  return (
    <div className="lg:hidden w-full flex justify-center p-8">
      <div className="flex flex-col gap-2 w-full max-w-2xl">
        {calendarData.slice(0, 25).map((cellData, index) => {
          const day = index + 1;
          return (
            <div
              key={day}
              className="flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold w-10 text-center">{day}</span>
                <span className="text-muted-foreground">{cellData.date}</span>
              </div>
              <div className="flex items-center gap-3">
                {cellData.declarationCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ✋ {cellData.declarationCount}
                  </span>
                )}
                {cellData.isUserDeclared && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    宣言済み
                  </span>
                )}
                {cellData.isUserDraft && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    下書き
                  </span>
                )}
                {cellData.isUserPublished && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    公開済み
                  </span>
                )}
                {cellData.hasPublishedArticle && !cellData.isUserPublished && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    記事あり
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default async function Home() {
  const supabase = await createClient();
  
  // Debug mode: Skip authentication check if DEBUG_DISABLE_AUTH is set to "true" or "1"
  const isDebugMode = process.env.DEBUG_DISABLE_AUTH === "true" || process.env.DEBUG_DISABLE_AUTH === "1";

  let profile = null;

  if (!isDebugMode) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    // Check if profile exists
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    
    profile = profileData;
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
    <main className="min-h-screen flex pt-20 xl:pt-0">
        {/* 左側: 説明エリア */}
        <div className="hidden w-1/3 lg:flex flex-col justify-center p-8">
        <div className="hidden flex-1 lg:flex items-center justify-center">
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
        <div className="hidden lg:block space-y-4 bg-card p-6 rounded-lg">
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

      {/* カレンダー表示: lg以上でGrid、lg未満でList */}
      <CalendarGrid calendarData={calendarData} hasProfile={!!profile} />
      <CalendarList calendarData={calendarData} hasProfile={!!profile} />
    </main>
  );
}
