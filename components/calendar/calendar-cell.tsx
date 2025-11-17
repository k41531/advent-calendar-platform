"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDeclaration } from "@/lib/actions/declarations";

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
  const getBorderStyle = () => {
    if (isUserPublished) {
      return "border-2 border-solid border-green-500";
    }
    if (isUserDraft) {
      return "border-2 border-dashed border-amber-500";
    }
    return "border-2 border-dotted border-primary";
  };

  // Determine background style
  const getBackgroundStyle = () => {
    if (isUserPublished) {
      return "bg-green-50 dark:bg-green-950/20";
    }
    if (isUserDraft) {
      return "bg-amber-50 dark:bg-amber-950/20";
    }
    return "bg-background";
  };

  return (
    <div
      className={`aspect-square w-full flex flex-col items-start justify-start ${getBorderStyle()} ${getBackgroundStyle()} rounded-lg ${hasPublishedArticle ? "cursor-pointer" : "cursor-default"} shadow-sm p-3 relative`}
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
            <span className="text-xs text-green-600 dark:text-green-400">✓</span>
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
