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
}

export function ReactionPanel({ articleId }: ReactionPanelProps) {
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
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
    setLoadingEmoji(emoji);

    // Perform server action
    startTransition(async () => {
      const result = await toggleReaction(articleId, emoji);

      if (!result.success) {
        // Rollback on error
        const rollbackReactions = new Set(userReactions);
        if (isAdding) {
          rollbackReactions.delete(emoji);
        } else {
          rollbackReactions.add(emoji);
        }
        setUserReactions(rollbackReactions);
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

          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReactionClick(emoji)}
                  disabled={isPending && isLoading}
                  className={cn(
                    "text-base h-8 w-8 p-0 transition-all hover:scale-110 rounded-full",
                    isActive &&
                      "bg-primary/10 border border-primary hover:bg-primary/20",
                    isLoading && "opacity-50"
                  )}
                  aria-label={`${label}でリアクションする`}
                >
                  {emoji}
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
