"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ChevronDown,
  Home,
  MessageCircle,
  ListTodo,
  BarChart3,
  Settings,
} from "lucide-react";

type HelpSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: {
    subtitle: string;
    image: string;
    descriptions: string[];
  }[];
};

const sections: HelpSection[] = [
  {
    id: "dashboard",
    title: "ダッシュボード",
    icon: <Home className="h-5 w-5" />,
    items: [
      {
        subtitle: "ダッシュボード",
        image: "/help/09-dashboard.png",
        descriptions: [
          "挨拶エリア: ユーザー名と今日の日付・時間帯に応じた挨拶が表示されます",
          "ストリーク表示: 現在の連続達成日数と最長記録が表示されます",
          "今日の習慣: 登録した習慣のチェックリストです。タップして完了を記録できます",
          "コーチングCTA: 「コーチングを始める」でAIコーチとの対話を開始します",
          "週間進捗: 今週の日別達成状況がドットで表示されます（緑=全達成、黄=半分以上、橙=一部）",
          "ナビゲーションバー: 各機能（ホーム・コーチング・習慣・進捗・設定）に移動します",
        ],
      },
    ],
  },
  {
    id: "coaching",
    title: "コーチング",
    icon: <MessageCircle className="h-5 w-5" />,
    items: [
      {
        subtitle: "コーチングトップ",
        image: "/help/10-coaching.png",
        descriptions: [
          "「新規セッション」ボタン: 新しいコーチングセッションを開始します",
          "AIコーチ紹介カード: AIコーチの説明と「コーチと話す」ボタンがあります",
          "セッション履歴: 過去のセッション一覧が表示されます",
        ],
      },
      {
        subtitle: "チャット画面",
        image: "/help/11-coaching-chat.png",
        descriptions: [
          "AIコーチがオンボーディングで設定した目的・価値観・動機を踏まえてパーソナライズされた対話を行います",
          "ヘッダー: 現在のセッション情報（ステップ番号・テーマ）が表示されます",
          "メッセージエリア: AIコーチとの対話内容が表示されます",
          "入力欄: メッセージを入力して送信ボタン（矢印）で送ります",
        ],
      },
      {
        subtitle: "セッションサマリー",
        image: "",
        descriptions: [
          "セッション完了後、AIが会話全体を分析して構造化サマリーを自動生成します",
          "テーマ・目標・現在地・強み・次のステップ・コーチからのメッセージが表示されます",
          "「おすすめの習慣を登録」ボタンで、AIが提案した習慣を事前入力された状態で登録できます",
          "一度生成されたサマリーはキャッシュされ、再度開くと即時表示されます",
        ],
      },
    ],
  },
  {
    id: "habits",
    title: "習慣管理",
    icon: <ListTodo className="h-5 w-5" />,
    items: [
      {
        subtitle: "習慣一覧",
        image: "/help/12-habits.png",
        descriptions: [
          "習慣カード: 登録した習慣が一覧表示されます。チェックボックスで今日の達成を記録できます",
          "進捗バー: 今日の全体達成率が表示されます",
          "追加ボタン: 新しい習慣を追加できます",
        ],
      },
      {
        subtitle: "新規習慣作成",
        image: "/help/13-habits-new.png",
        descriptions: [
          "習慣名: 毎日実行する具体的な行動を入力します",
          "カテゴリ: 健康・学習・仕事・生活・その他から選択します",
          "2分バージョン: 最初の一歩を2分以内で始められる形にしたものです（例: ランニング → シューズを履く）",
          "習慣スタッキング: 既存の習慣の後に紐づけるトリガーを設定します（例: 朝コーヒーを入れた後に）",
          "If-Thenプラン: 「もし〜したら、〜する」形式の実行計画を設定します",
          "頻度: 毎日・平日・週末・カスタム（曜日選択）から選べます",
        ],
      },
    ],
  },
  {
    id: "progress",
    title: "進捗確認",
    icon: <BarChart3 className="h-5 w-5" />,
    items: [
      {
        subtitle: "進捗ページ",
        image: "/help/14-progress.png",
        descriptions: [
          "進捗・統計: 習慣の達成状況やストリーク（連続達成日数）を確認できます",
          "KPIカード: 達成率・完了回数・習慣数を一覧で確認できます",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "設定",
    icon: <Settings className="h-5 w-5" />,
    items: [
      {
        subtitle: "設定ページ",
        image: "/help/15-settings.png",
        descriptions: [
          "プロフィールセクション: ユーザー名とアイコンが表示されます。タップしてプロフィール編集へ",
          "表示設定: ダークモードの切り替え（準備中）",
          "アカウント: ログアウトやアカウント削除",
          "アプリ情報: バージョン情報、使い方ガイド、プライバシーポリシー、利用規約、お問い合わせ",
        ],
      },
      {
        subtitle: "プロフィール編集",
        image: "/help/16-settings-profile.png",
        descriptions: [
          "ニックネーム入力: 表示名を変更できます",
          "目的の変更: オンボーディングで設定した目的を変更できます。変更はその後のコーチングに反映されます",
          "保存ボタン: 変更を保存します",
        ],
      },
    ],
  },
];

export default function HelpContent() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="container mx-auto max-w-md space-y-4 px-4 py-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          設定
        </Link>
      </div>
      <h1 className="text-xl font-bold">使い方ガイド</h1>

      {/* セクション一覧 */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <Card key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-accent/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{section.icon}</span>
                  <span className="font-medium">{section.title}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <CardContent className="space-y-6 pt-0">
                  {section.items.map((item) => (
                    <div key={item.subtitle} className="space-y-3">
                      {section.items.length > 1 && (
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          {item.subtitle}
                        </h3>
                      )}
                      {item.image && (
                        <div className="overflow-hidden rounded-lg border p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.subtitle}
                            className="w-full h-auto rounded"
                          />
                        </div>
                      )}
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {item.descriptions.map((desc, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="shrink-0">•</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
