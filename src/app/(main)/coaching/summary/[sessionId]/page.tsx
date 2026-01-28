"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  Target,
  Lightbulb,
  ListChecks,
  Sparkles,
  Home,
} from "lucide-react";
import { SessionProgress } from "@/components/features/coaching";

/**
 * デモ用のセッションサマリーデータ
 * 実際のAPI連携時にはサーバーからフェッチする
 */
const DEMO_SUMMARY = {
  id: "session-completed-1",
  theme: "仕事のストレス対策",
  date: "2026年1月22日",
  duration: "12分",
  messageCount: 14,
  completedSteps: 9 as const,
  goal: "1週間前から計画的に準備を始め、締め切りのストレスを減らす",
  currentState: "締め切り直前に焦ることが多く、ストレスを感じている",
  strengths: ["粘り強さ", "責任感の強さ", "前向きに取り組む姿勢"],
  actionItems: [
    "毎朝5分、今日の優先事項を確認する",
    "週末に翌週のスケジュールを30分かけて整理する",
    "大きなタスクは小さなステップに分解する",
  ],
  coachMessage:
    "今日のセッションでは、あなたの粘り強さと責任感の強さという素晴らしい強みが見えてきました。\n\nまずは明日の朝、5分だけ優先事項を確認することから始めてみてください。小さな一歩が、大きな変化につながります。\n\nあなたならきっとできます。応援しています！",
};

/**
 * セッションサマリー画面
 * - セッション完了後のまとめ
 * - 目標・現在地・次のステップ
 * - 「この目標を習慣に登録」ボタン
 */
export default function SessionSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const _sessionId = params.sessionId as string;

  // デモデータを使用（実際にはAPIからフェッチ）
  const summary = DEMO_SUMMARY;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
      {/* ヘッダー */}
      <header className="border-b bg-background">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -ml-2"
            onClick={() => router.push("/coaching")}
            aria-label="戻る"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-sm">セッション完了</h1>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 完了バナー */}
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-lg font-bold">お疲れさまでした！</h2>
            <p className="text-sm text-muted-foreground mt-1">
              素晴らしいセッションでした
            </p>
          </div>

          {/* セッション情報 */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>{summary.date}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{summary.duration}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{summary.messageCount} メッセージ</span>
          </div>

          {/* 進捗表示 */}
          <SessionProgress currentStep={summary.completedSteps} />

          {/* セッションまとめカード */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                セッションまとめ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  テーマ
                </p>
                <p className="text-sm">{summary.theme}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  設定した目標
                </p>
                <p className="text-sm">{summary.goal}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  現在地
                </p>
                <p className="text-sm">{summary.currentState}</p>
              </div>
            </CardContent>
          </Card>

          {/* 発見した強み */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                あなたの強み
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.strengths.map((strength) => (
                  <Badge key={strength} variant="secondary">
                    {strength}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 次のステップ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-success" />
                次のステップ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {summary.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-success/10 text-success text-xs flex items-center justify-center font-medium mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* コーチからのメッセージ */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                コーチからのメッセージ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                {summary.coachMessage.split("\n\n").map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="space-y-2 pt-2 pb-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/habits/new">
                <Target className="h-4 w-4 mr-2" />
                この目標を習慣に登録
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
