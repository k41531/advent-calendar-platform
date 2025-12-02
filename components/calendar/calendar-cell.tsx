"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createDeclaration } from "@/lib/actions/declarations";
import { getDateState, isToday } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { DeclarationConfirmDialog } from "./declaration-confirm-dialog";
import { ProfileSetupModal } from "@/components/profile/profile-setup-modal";

interface CalendarCellProps {
  day: number;
  date: string; // YYYY-MM-DD format
  isUserDraft?: boolean;
  isUserPublished?: boolean;
  hasPublishedArticle?: boolean;
  declarationCount?: number;
  isUserDeclared?: boolean;
  hasProfile?: boolean;
  publishedArticles?: Array<{
    id: string;
    title: string;
  }>;
}

export function CalendarCell({
  day,
  date,
  isUserDraft = false,
  isUserPublished = false,
  hasPublishedArticle = false,
  declarationCount = 0,
  isUserDeclared = false,
  hasProfile = true,
  publishedArticles = [],
}: CalendarCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeclared, setIsDeclared] = useState(isUserDeclared);
  const [currentDeclarationCount, setCurrentDeclarationCount] = useState(declarationCount);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTodayDate, setIsTodayDate] = useState(false);
  const [dateState, setDateState] = useState<'past' | 'today' | 'future'>('future');
  const [hoveredArticleId, setHoveredArticleId] = useState<string | null>(null);
  const router = useRouter();

  // クライアントサイドでのみ日付判定を行う（SSRとのハイドレーションミスマッチを防ぐ）
  useEffect(() => {
    setIsTodayDate(isToday(date));
    setDateState(getDateState(date));
  }, [date]);

  // Handle cell click - navigate to article page if published articles exist
  const handleCellClick = () => {
    if (hasPublishedArticle) {
      router.push(`/calendar/${date}`);
    }
  };

  // Handle declaration button click
  const handleDeclare = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDeclared) {
      return;
    }

    setIsDialogOpen(true);
  };

  // Handle confirmation from dialog
  const handleConfirmDeclaration = async () => {
    const result = await createDeclaration(date);
    if (result.success) {
      setIsDeclared(true);
      setCurrentDeclarationCount((prev) => prev + 1);
    } else {
      throw new Error(result.error || "宣言に失敗しました");
    }
  };

  // Determine border style based on user's status
  // 優先順位: 公開 > 下書き > 宣言 > 今日 > 過去/未来
  // ルール: 過去と今日は実線、未来は破線
  const getBorderStyle = () => {
    const borderWidth = "border-2";
    const borderStyle = dateState === "future" ? "border-dashed" : "border-solid";

    if (isUserPublished) {
      // 公開済み: オレンジ
      return `${borderWidth} ${borderStyle} border-[hsl(var(--color-orange))]`;
    }
    if (isUserDraft) {
      // 下書き: ピンク
      return `${borderWidth} ${borderStyle} border-[hsl(var(--color-pink))]`;
    }
    if (dateState === "today") {
      // 今日: オレンジ実線（光るアニメーション付き）
      return `${borderWidth} border-solid border-[hsl(var(--color-orange))]`;
    }
    if (dateState === "past") {
      // 過去: プライマリ実線
      return `${borderWidth} border-solid border-primary`;
    }
    if (dateState === "future") {
      // 未来: タン破線
      return `${borderWidth} border-dashed border-[hsl(var(--color-tan))]`;
    }
    return `${borderWidth} ${borderStyle} border-primary`;
  };

  // Determine background style
  const getBackgroundStyle = () => {
    // 未来のみ amber-50 背景、それ以外は背景色
    if (dateState === "future") {
      return "bg-amber-50 dark:bg-amber-950/20";
    }
    return "bg-background";
  };

  return (
    <div
      className={cn(
        "aspect-square w-full flex flex-col items-start justify-start rounded-lg shadow-sm p-3 relative",
        getBorderStyle(),
        getBackgroundStyle(),
        hasPublishedArticle ? "cursor-pointer" : "cursor-default",
        // 今日のセルには光るアニメーション
        isTodayDate && "animate-[glow_2s_ease-in-out_infinite]",
        // 下書きには控えめな光るアニメーション
        isUserDraft && !isTodayDate && "animate-[glow-subtle_3s_ease-in-out_infinite]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCellClick}
    >
      <span className="font-[family-name:var(--font-kode-mono)] text-2xl">{day}</span>

      {/* Status indicator */}
      {(isUserDraft || isUserPublished || isDeclared) && (
        <div className="absolute top-2 right-2 flex gap-1">
          {isDeclared && (
            <span className="text-xs">✋</span>
          )}
          {isUserPublished && (
            <span className="text-xs text-amber-600 dark:text-amber-400">✓</span>
          )}
          {isUserDraft && (
            <span className="text-xs text-amber-600 dark:text-amber-400">📝</span>
          )}
        </div>
      )}

      {/* Article list */}
      {publishedArticles && publishedArticles.length > 0 && (
        <div className="mt-2 w-full space-y-1 flex-1 overflow-hidden">
          {publishedArticles.slice(0, 3).map((article) => (
            <div
              key={article.id}
              className={cn(
                "text-xs text-muted-foreground overflow-hidden whitespace-nowrap relative h-4",
                hoveredArticleId !== article.id && "truncate"
              )}
              title={article.title}
              onMouseEnter={() => setHoveredArticleId(article.id)}
              onMouseLeave={() => setHoveredArticleId(null)}
            >
              {hoveredArticleId === article.id ? (
                <span className="inline-block animate-marquee">
                  {article.title}
                </span>
              ) : (
                article.title
              )}
            </div>
          ))}
          {publishedArticles.length > 3 && (
            <div className="text-xs text-muted-foreground/70">
              +{publishedArticles.length - 3}件
            </div>
          )}
        </div>
      )}

      {/* Declaration count display */}
      {currentDeclarationCount > 0 && (
        <div className="mt-auto mb-1 text-xs text-muted-foreground">
          {currentDeclarationCount}人が宣言中
        </div>
      )}

      {/* Reaction buttons */}
      <div
        className={`absolute bottom-2 right-2 flex gap-1 transition-all duration-300 ease-out ${
          isHovered
            ? "translate-x-0 opacity-100"
            : "translate-x-5 opacity-0 pointer-events-none"
        }`}
      >
        <button
          className={`w-8 h-8 flex items-center justify-center bg-background rounded-full hover:bg-[radial-gradient(circle,hsl(var(--accent))_0%,hsl(var(--accent)/0.2)_50%,transparent_100%)] transition-all duration-200 shadow-sm relative overflow-hidden ${
            isDeclared ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleDeclare}
          aria-label="Declare to write"
          disabled={isDeclared}
        >
          <span className="text-lg relative z-10">✋</span>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-background rounded-full hover:bg-[radial-gradient(circle,hsl(var(--accent))_0%,hsl(var(--accent)/0.2)_50%,transparent_100%)] transition-all duration-200 shadow-sm relative overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasProfile) {
              setIsProfileModalOpen(true);
            } else {
              router.push(`/articles/new?date=${day}`);
            }
          }}
          aria-label="Write"
        >
          <span className="text-lg relative z-10">🖋️</span>
        </button>
      </div>

      {/* Declaration confirmation dialog */}
      <DeclarationConfirmDialog
        date={date}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmDeclaration}
      />

      {/* Profile setup modal */}
      <ProfileSetupModal
        open={isProfileModalOpen}
        onSuccess={() => {
          setIsProfileModalOpen(false);
          router.push(`/articles/new?date=${day}`);
        }}
      />
    </div>
  );
}
