"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AccountSection,
} from "@/components/features/settings";
import { getProfile } from "@/lib/actions/profile";
import type { ProfileData } from "@/lib/actions/profile";
import { useSession } from "@/lib/auth/client";
import {
  ChevronRight,
  Moon,
  Info,
  FileText,
  Shield,
  Mail,
  HelpCircle,
} from "lucide-react";

const PURPOSE_LABELS: Record<string, string> = {
  performance: "パフォーマンス向上",
  mental: "メンタル強化",
  transformation: "自己変革",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const result = await getProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      }
    };
    loadProfile();
  }, []);

  const userName = profile?.nickname || session?.user?.name || "ユーザー";
  const userImage = session?.user?.image || undefined;
  const userInitial = userName.charAt(0);
  const purposeLabel = profile?.purpose
    ? PURPOSE_LABELS[profile.purpose] || profile.purpose
    : "未設定";

  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* ヘッダー */}
      <h1 className="text-xl font-bold">設定</h1>

      {/* プロフィールセクション */}
      <Link href="/settings/profile">
        <Card className="transition-colors hover:bg-accent/50">
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="text-lg">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{userName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {purposeLabel}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>

      {/* 表示設定 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">表示設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="dark-mode" className="cursor-pointer">
                ダークモード
              </Label>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
          {darkMode && (
            <p className="mt-2 text-xs text-muted-foreground pl-8">
              ダークモードは現在準備中です
            </p>
          )}
        </CardContent>
      </Card>

      {/* アカウント */}
      <AccountSection />

      {/* アプリ情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">アプリ情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-2">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">バージョン</span>
            </div>
            <span className="text-sm text-muted-foreground">0.1.0</span>
          </div>

          <Separator className="mx-3" />

          <Link
            href="/help"
            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span>使い方ガイド</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Separator className="mx-3" />

          <button className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent/50">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span>プライバシーポリシー</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent/50">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>利用規約</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent/50">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>お問い合わせ</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
