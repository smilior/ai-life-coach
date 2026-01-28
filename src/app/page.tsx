import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Target, Flame, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヒーローセクション */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* ロゴ/タイトル */}
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              AIライフコーチ
            </h1>
            <p className="text-lg text-muted-foreground">
              2分から始まる、あなただけの成長ストーリー
            </p>
          </div>

          {/* 特徴カード */}
          <div className="space-y-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">AIコーチとの対話</h3>
                  <p className="text-sm text-muted-foreground">
                    あなたの悩みに寄り添い、一緒に解決策を見つけます
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">スモールステップで行動</h3>
                  <p className="text-sm text-muted-foreground">
                    2分で始められる小さな行動から成長を実感
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                  <Flame className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">習慣化サポート</h3>
                  <p className="text-sm text-muted-foreground">
                    継続をサポートし、達成感を積み重ねます
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTAボタン */}
          <div className="space-y-3 pt-4">
            <Button asChild className="w-full" size="xl">
              <Link href="/onboarding">無料で始める</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/login">ログイン</Link>
            </Button>
          </div>

          {/* フッターテキスト */}
          <p className="text-xs text-muted-foreground">
            アカウント作成で利用規約とプライバシーポリシーに同意したものとみなされます
          </p>
        </div>
      </main>
    </div>
  );
}
