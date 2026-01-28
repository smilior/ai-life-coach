import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "進捗 | AIライフコーチ",
  description: "あなたの成長と達成を確認しましょう。",
};

const weeklyStats = [
  { day: "月", completed: 4, total: 4 },
  { day: "火", completed: 3, total: 4 },
  { day: "水", completed: 4, total: 4 },
  { day: "木", completed: 2, total: 4 },
  { day: "金", completed: 4, total: 4 },
  { day: "土", completed: 3, total: 4 },
  { day: "日", completed: 2, total: 4 },
];

const badges = [
  { name: "7日連続達成", icon: Flame, color: "text-secondary", earned: true },
  { name: "習慣マスター", icon: Trophy, color: "text-badge-gold", earned: true },
  { name: "目標設定完了", icon: Target, color: "text-primary", earned: true },
  { name: "30日継続", icon: TrendingUp, color: "text-muted-foreground", earned: false },
];

export default function ProgressPage() {
  const totalCompleted = weeklyStats.reduce((acc, day) => acc + day.completed, 0);
  const totalTasks = weeklyStats.reduce((acc, day) => acc + day.total, 0);
  const weeklyRate = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* ヘッダー */}
      <section>
        <h1 className="text-2xl font-bold">進捗</h1>
        <p className="text-sm text-muted-foreground">
          あなたの成長を振り返りましょう
        </p>
      </section>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="mx-auto mb-2 h-8 w-8 text-secondary" />
            <p className="text-2xl font-bold">7</p>
            <p className="text-xs text-muted-foreground">連続日数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="mx-auto mb-2 h-8 w-8 text-badge-gold" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">獲得バッジ</p>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">週間</TabsTrigger>
          <TabsTrigger value="badges">バッジ</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-4 space-y-4">
          {/* 週間達成率 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">今週の達成率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl font-bold">{weeklyRate}%</span>
                <Badge variant="success">Good</Badge>
              </div>
              <Progress value={weeklyRate} className="h-3" />
            </CardContent>
          </Card>

          {/* 日別達成状況 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">日別達成状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                {weeklyStats.map((stat) => (
                  <div key={stat.day} className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-16 w-8 flex-col justify-end overflow-hidden rounded-md bg-muted"
                    >
                      <div
                        className="w-full bg-primary transition-all"
                        style={{
                          height: `${(stat.completed / stat.total) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stat.day}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-4">
              {badges.map((badge) => (
                <div
                  key={badge.name}
                  className={`flex flex-col items-center gap-2 rounded-lg p-4 ${
                    badge.earned ? "bg-muted" : "bg-muted/50 opacity-50"
                  }`}
                >
                  <badge.icon className={`h-10 w-10 ${badge.color}`} />
                  <span className="text-center text-xs font-medium">
                    {badge.name}
                  </span>
                  {badge.earned && (
                    <Badge variant="success" className="text-xs">
                      獲得済み
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
