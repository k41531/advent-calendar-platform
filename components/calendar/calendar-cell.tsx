"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDeclaration } from "@/lib/actions/declarations";
import { getDateState, isToday } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface CalendarCellProps {
  day: number;
  date: string; // YYYY-MM-DD format
  isUserDraft?: boolean;
  isUserPublished?: boolean;
  hasPublishedArticle?: boolean;
  declarationCount?: number;
  isUserDeclared?: boolean;
}

export function CalendarCell({
  day,
  date,
  isUserDraft = false,
  isUserPublished = false,
  hasPublishedArticle = false,
  declarationCount = 0,
  isUserDeclared = false,
}: CalendarCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeclared, setIsDeclared] = useState(isUserDeclared);
  const [currentDeclarationCount, setCurrentDeclarationCount] = useState(declarationCount);
  const router = useRouter();
  const isTodayDate = isToday(date);
  const dateState = getDateState(date);

  // Handle cell click - navigate to article page if published articles exist
  const handleCellClick = () => {
    if (hasPublishedArticle) {
      router.push(`/calendar/${date}`);
    }
  };

  // Handle declaration
  const handleDeclare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDeclared) {
      // Already declared - show info
      alert("既にこの日に宣言済みです");
      return;
    }

    const result = await createDeclaration(date);
    if (result.success) {
      setIsDeclared(true);
      setCurrentDeclarationCount((prev) => prev + 1);
    } else {
      alert(result.error || "宣言に失敗しました");
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
            router.push(`/articles/new?date=${day}`);
          }}
          aria-label="Write"
        >
          <span className="text-lg relative z-10">🖋️</span>
        </button>
      </div>
    </div>
  );
}
