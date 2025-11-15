"use client";

import { useState } from "react";

interface CalendarCellProps {
  day: number;
}

export function CalendarCell({ day }: CalendarCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="aspect-square w-full flex items-start justify-start border-2 border-dotted border-primary bg-background rounded-lg cursor-pointer shadow-sm p-3 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="font-[family-name:var(--font-kode-mono)] text-2xl">{day}</span>

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
            // TODO: Handle pen reaction
          }}
          aria-label="Write"
        >
          <span className="text-lg relative z-10">🖋️</span>
        </button>
      </div>
    </div>
  );
}
