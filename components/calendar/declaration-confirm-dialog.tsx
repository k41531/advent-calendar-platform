"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatJapaneseDate, getDaysUntil } from "@/lib/date-utils";
import { useState } from "react";

interface DeclarationConfirmDialogProps {
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeclarationConfirmDialog({
  date,
  open,
  onOpenChange,
  onConfirm,
}: DeclarationConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysUntil = getDaysUntil(date);
  const formattedDate = formatJapaneseDate(date);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "宣言に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysText = () => {
    if (daysUntil === 0) return "今日";
    if (daysUntil === 1) return "明日";
    if (daysUntil > 0) return `あと${daysUntil}日`;
    return `${Math.abs(daysUntil)}日前`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-white border-none">
        <DialogHeader>
          <DialogTitle>書きます宣言</DialogTitle>
          <DialogDescription>
            この日に記事を書くことを宣言しますか？
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-center justify-center gap-3 text-lg">
            <span className="text-3xl">🗓️</span>
            <div>
              <span className="font-semibold">{formattedDate}</span>
              <span className="ml-2 text-muted-foreground">
                ({getDaysText()})
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "宣言中..." : "宣言する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
