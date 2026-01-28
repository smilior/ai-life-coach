import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MessageCircle, Flame, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "ダッシュボード | AIライフコーチ",
  description: "今日のあなたの進捗を確認しましょう。",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* 挨拶セクション */}
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">おはようございます</h1>
        <p className="text-muted-foreground">
          今日も一緒に頑張りましょう
        </p>
      </section>

      {/* ストリークカード */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Flame className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">連続達成</p>
              <p className="text-2xl font-bold">7日</p>
            </div>
          </div>
          <Badge variant="streak">継続中</Badge>
        </CardContent>
      </Card>

      {/* コーチングCTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold">AIコーチと話す</h3>
                <p className="text-sm text-muted-foreground">
                  今日の気分や目標について相談しましょう
                </p>
              </div>
              <Button className="w-full">コーチングを始める</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 今日の習慣 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">今日の習慣</h2>
          <Badge variant="outline">2/4 完了</Badge>
        </div>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>朝のストレッチ</span>
                <span className="text-success">完了</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>読書15分</span>
                <span className="text-success">完了</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>瞑想5分</span>
                <span className="text-muted-foreground">未完了</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>日記を書く</span>
                <span className="text-muted-foreground">未完了</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 達成バッジ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">最近の達成</h2>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-badge-gold/10">
              <Trophy className="h-6 w-6 text-badge-gold" />
            </div>
            <div>
              <p className="font-medium">7日連続達成</p>
              <p className="text-sm text-muted-foreground">
                素晴らしい継続力です！
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
