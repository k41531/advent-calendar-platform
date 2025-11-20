"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const completeProfile = async () => {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("ユーザー情報の取得に失敗しました");
        setIsLoading(false);
        return;
      }

      // Get pen_name from localStorage
      const penName = localStorage.getItem("pendingPenName");

      if (!penName) {
        setError("ペンネームが見つかりませんでした。もう一度ログインしてください。");
        setIsLoading(false);
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          pen_name: penName,
        });

      if (profileError) {
        if (profileError.code === "23505") {
          // Unique constraint violation
          setError("このペンネームは既に使用されています。別のペンネームでログインし直してください。");
        } else {
          setError(`プロフィールの作成に失敗しました: ${profileError.message}`);
        }
        setIsLoading(false);
        return;
      }

      // Clear localStorage
      localStorage.removeItem("pendingPenName");

      // Redirect to home
      router.push("/");
    };

    completeProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>プロフィールを作成中...</CardTitle>
            <CardDescription>少々お待ちください</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>エラーが発生しました</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="w-full">
              ログインページに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
