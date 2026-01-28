import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "習慣 | AIライフコーチ",
  description: "日々の習慣を管理して、理想の自分に近づきましょう。",
};

const habits = [
  {
    id: "1",
    name: "朝のストレッチ",
    description: "5分間の簡単なストレッチ",
    streak: 7,
    completed: true,
    category: "健康",
  },
  {
    id: "2",
    name: "読書15分",
    description: "好きな本を15分読む",
    streak: 12,
    completed: true,
    category: "学習",
  },
  {
    id: "3",
    name: "瞑想5分",
    description: "朝の瞑想タイム",
    streak: 3,
    completed: false,
    category: "マインド",
  },
  {
    id: "4",
    name: "日記を書く",
    description: "一日の振り返りを記録",
    streak: 5,
    completed: false,
    category: "マインド",
  },
];

export default function HabitsPage() {
  const completedCount = habits.filter((h) => h.completed).length;

  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* ヘッダー */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">今日の習慣</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{habits.length} 完了
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </section>

      {/* 進捗バー */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex justify-between text-sm">
                <span>今日の進捗</span>
                <span className="font-medium">
                  {Math.round((completedCount / habits.length) * 100)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(completedCount / habits.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 習慣リスト */}
      <section className="space-y-3">
        {habits.map((habit, index) => (
          <div key={habit.id}>
            <Card
              className={habit.completed ? "border-success/50 bg-success/5" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={habit.id}
                    checked={habit.completed}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={habit.id}
                        className={`font-medium ${
                          habit.completed
                            ? "text-muted-foreground line-through"
                            : ""
                        }`}
                      >
                        {habit.name}
                      </label>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Flame className="h-3 w-3 text-secondary" />
                        <span>{habit.streak}日</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {habit.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {habit.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            {index < habits.length - 1 && <div className="h-2" />}
          </div>
        ))}
      </section>
    </div>
  );
}
