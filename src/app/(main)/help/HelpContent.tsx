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
          "挨拶エリア: ユーザー名と今日の日付が表示されます",
          "デイリーチェックイン: 「今日の気分は？」から気分を選択します",
          "コーチングCTA: 「コーチングを始める」でAIコーチとの対話を開始します",
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
          "ヘッダー: 現在のセッション情報（ステップ番号・テーマ）が表示されます",
          "メッセージエリア: AIコーチとの対話内容が表示されます",
          "入力欄: メッセージを入力して送信ボタン（矢印）で送ります",
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
          "習慣管理: 登録した習慣が一覧表示されます。各習慣の達成状況が確認できます",
          "追加ボタン: 新しい習慣を追加できます",
        ],
      },
      {
        subtitle: "新規習慣作成",
        image: "/help/13-habits-new.png",
        descriptions: [
          "入力フォーム: 習慣名・説明・頻度などの詳細を入力します",
          "保存ボタン: 入力後に保存して習慣を登録します",
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
          "プロフィールセクション: ユーザー名とアイコンが表示されます",
          "設定項目: 通知・ダークモード・アカウント情報などを変更できます",
        ],
      },
      {
        subtitle: "プロフィール編集",
        image: "/help/16-settings-profile.png",
        descriptions: [
          "ニックネーム入力: 表示名を変更できます",
          "目的の変更: オンボーディングで設定した目的を変更できます",
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
                      <div className="overflow-hidden rounded-lg border p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.subtitle}
                          className="w-full h-auto rounded"
                        />
                      </div>
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
