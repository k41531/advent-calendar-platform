"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AVAILABLE_REACTIONS } from "@/lib/constants/reactions";
import {
  getUserReactionsForArticle,
  toggleReaction,
} from "@/lib/actions/reactions";
import { cn } from "@/lib/utils";

interface ReactionPanelProps {
  articleId: string;
  reactionCounts: Record<string, number>;
}

export function ReactionPanel({ articleId, reactionCounts: initialCounts }: ReactionPanelProps) {
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(initialCounts);
  const [isPending, startTransition] = useTransition();
  const [loadingEmoji, setLoadingEmoji] = useState<string | null>(null);

  // Fetch user's reactions on mount
  useEffect(() => {
    async function fetchReactions() {
      const result = await getUserReactionsForArticle(articleId);
      if (result.success && result.data) {
        const reactionTypes = new Set(
          result.data.map((r) => r.reaction_type)
        );
        setUserReactions(reactionTypes);
      }
    }
    fetchReactions();
  }, [articleId]);

  // Update reaction counts when prop changes
  useEffect(() => {
    setReactionCounts(initialCounts);
  }, [initialCounts]);

  const handleReactionClick = (emoji: string) => {
    // Optimistic update
    const newReactions = new Set(userReactions);
    const isAdding = !newReactions.has(emoji);

    if (isAdding) {
      newReactions.add(emoji);
    } else {
      newReactions.delete(emoji);
    }
    setUserReactions(newReactions);

    // Optimistically update counts
    const newCounts = { ...reactionCounts };
    if (isAdding) {
      newCounts[emoji] = (newCounts[emoji] || 0) + 1;
    } else {
      newCounts[emoji] = Math.max((newCounts[emoji] || 0) - 1, 0);
    }
    setReactionCounts(newCounts);
    setLoadingEmoji(emoji);

    // Perform server action
    startTransition(async () => {
      const result = await toggleReaction(articleId, emoji);

      if (!result.success) {
        // Rollback on error
        const rollbackReactions = new Set(userReactions);
        const rollbackCounts = { ...reactionCounts };
        if (isAdding) {
          rollbackReactions.delete(emoji);
          rollbackCounts[emoji] = (rollbackCounts[emoji] || 0) - 1;
        } else {
          rollbackReactions.add(emoji);
          rollbackCounts[emoji] = (rollbackCounts[emoji] || 0) + 1;
        }
        setUserReactions(rollbackReactions);
        setReactionCounts(rollbackCounts);
        console.error("Reaction failed:", result.error);
      }

      setLoadingEmoji(null);
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-1">
        {AVAILABLE_REACTIONS.map(({ emoji, label }) => {
          const isActive = userReactions.has(emoji);
          const isLoading = loadingEmoji === emoji;
          const count = reactionCounts[emoji] || 0;

          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReactionClick(emoji)}
                  disabled={isPending && isLoading}
                  className={cn(
                    "text-base h-8 px-2 transition-all hover:scale-110 rounded-full",
                    isActive &&
                      "bg-primary/10 border border-primary hover:bg-primary/20",
                    isLoading && "opacity-50",
                    count > 0 ? "min-w-12" : "w-8 p-0"
                  )}
                  aria-label={`${label}でリアクションする`}
                >
                  <span className="flex items-center gap-1">
                    {emoji}
                    {count > 0 && (
                      <span className="text-xs font-medium">{count}</span>
                    )}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
