"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSetupModalProps {
  open: boolean;
  userId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ProfileSetupModal({
  open,
  userId: providedUserId,
  onSuccess,
  onCancel,
}: ProfileSetupModalProps) {
  const [penName, setPenName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(providedUserId || null);

  useEffect(() => {
    if (!providedUserId && open) {
      // Fetch user ID from Supabase
      const fetchUserId = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      };
      fetchUserId();
    }
  }, [providedUserId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!penName.trim()) {
      setError("ペンネームを入力してください");
      return;
    }

    if (!userId) {
      setError("ユーザー情報の取得に失敗しました");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          pen_name: penName.trim(),
          role: 'user',
        });

      if (profileError) {
        if (profileError.code === "23505") {
          setError("このペンネームは既に使用されています。別のペンネームを入力してください。");
        } else {
          setError(`プロフィールの作成に失敗しました: ${profileError.message}`);
        }
        setIsLoading(false);
        return;
      }

      // 成功
      onSuccess();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onCancel?.()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>プロフィールを設定してください</DialogTitle>
            <DialogDescription>
              アドベントカレンダーで使用するペンネームを入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="penName">ペンネーム</Label>
              <Input
                id="penName"
                type="text"
                placeholder="ペンネームを入力"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !penName.trim()}>
              {isLoading ? "作成中..." : "プロフィールを作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
