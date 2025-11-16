"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CalendarCellProps {
  day: number;
  isUserDraft?: boolean;
  isUserPublished?: boolean;
  hasPublishedArticle?: boolean;
  declarationCount?: number;
}

export function CalendarCell({
  day,
  isUserDraft = false,
  isUserPublished = false,
  hasPublishedArticle = false,
  declarationCount = 0,
}: CalendarCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

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
      className={`aspect-square w-full flex flex-col items-start justify-start ${getBorderStyle()} ${getBackgroundStyle()} rounded-lg cursor-pointer shadow-sm p-3 relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="font-[family-name:var(--font-kode-mono)] text-2xl">{day}</span>

      {/* Status indicator */}
      {(isUserDraft || isUserPublished) && (
        <div className="absolute top-2 right-2">
          {isUserPublished && (
            <span className="text-xs text-green-600 dark:text-green-400">✓</span>
          )}
          {isUserDraft && (
            <span className="text-xs text-amber-600 dark:text-amber-400">📝</span>
          )}
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
          className="w-8 h-8 flex items-center justify-center bg-background rounded-full hover:bg-[radial-gradient(circle,hsl(var(--accent))_0%,hsl(var(--accent)/0.2)_50%,transparent_100%)] transition-all duration-200 shadow-sm relative overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Handle raise hand reaction
          }}
          aria-label="Raise hand"
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
