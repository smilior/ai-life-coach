"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getProfile, updateProfile } from "@/lib/actions/profile";
import type { ProfileData } from "@/lib/actions/profile";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

type Purpose = "performance" | "mental" | "transformation";

const PURPOSE_OPTIONS: { value: Purpose; label: string; description: string }[] = [
  {
    value: "performance",
    label: "パフォーマンス向上",
    description: "仕事や学業の成果を最大化したい",
  },
  {
    value: "mental",
    label: "メンタル強化",
    description: "心の安定と精神的な強さを得たい",
  },
  {
    value: "transformation",
    label: "自己変革",
    description: "新しい自分に生まれ変わりたい",
  },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("performance");
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getProfile();
        if (result.success && result.data) {
          const p = result.data;
          setNickname(p.nickname || "");
          setPurpose((p.purpose as Purpose) || "performance");
          setWakeUpTime(p.wakeUpTime || "07:00");
          setSleepTime(p.sleepTime || "23:00");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        nickname: nickname || undefined,
        purpose,
        wakeUpTime,
        sleepTime,
      });

      if (result.success) {
        toast({
          title: "保存しました",
          description: "プロフィールが更新されました。",
        });
        router.push("/settings");
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error || "保存に失敗しました。",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "保存に失敗しました。もう一度お試しください。",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex max-w-md items-center justify-center px-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="rounded-lg p-1 transition-colors hover:bg-accent"
          aria-label="設定に戻る"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">プロフィール編集</h1>
      </div>

      {/* ニックネーム */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            ニックネーム
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="nickname" className="sr-only">
              ニックネーム
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ニックネームを入力"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              コーチがあなたをこの名前で呼びます
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 目的 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">目的</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PURPOSE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPurpose(option.value)}
              className={`flex w-full flex-col rounded-lg border p-3 text-left transition-colors ${
                purpose === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent/50"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  purpose === option.value
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* 生活リズム */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            生活リズム
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="wake-up-time" className="text-sm">
              起床時刻
            </Label>
            <input
              id="wake-up-time"
              type="time"
              value={wakeUpTime}
              onChange={(e) => setWakeUpTime(e.target.value)}
              className="rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="sleep-time" className="text-sm">
              就寝時刻
            </Label>
            <input
              id="sleep-time"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="pb-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>保存する</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
