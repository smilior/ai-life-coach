/**
 * AIによるセッションサマリー生成
 * コーチングセッション完了後に全会話を分析し、
 * 構造化サマリーと具体的な習慣提案を生成する
 */

import { generateObject } from "ai";
import { z } from "zod";
import { getOpenAIProvider } from "./chat";
import { OPENAI_MODELS } from "./config";

// ============================================================================
// Schema
// ============================================================================

export const sessionSummarySchema = z.object({
  theme: z.string().describe("セッションの主要テーマ（1文）"),
  goal: z.string().describe("ユーザーが達成したい目標・理想の状態"),
  currentState: z.string().describe("ユーザーの現在の状況・立ち位置"),
  strengths: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("セッション中に発見されたユーザーの強み"),
  actionItems: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("具体的な次のステップ・アクションアイテム"),
  coachMessage: z
    .string()
    .describe("コーチからの総括メッセージ（2〜3文、温かみのある言葉）"),
  habitSuggestion: z.object({
    name: z
      .string()
      .describe(
        "習慣の名前（毎日実行する具体的な行動。「〜する」形式。例: 朝10分ストレッチする）"
      ),
    description: z
      .string()
      .describe("習慣の説明（なぜこの習慣が目標達成に役立つか）"),
    category: z
      .enum(["health", "learning", "work", "life", "other"])
      .describe("習慣のカテゴリ"),
    twoMinuteVersion: z
      .string()
      .describe(
        "2分以内で完了できる最小バージョン（例: ストレッチマットを敷く）"
      ),
    trigger: z
      .string()
      .describe(
        "習慣のきっかけ・トリガー（既存の習慣に紐づける。例: 朝コーヒーを淹れた後）"
      ),
    ifThenPlan: z
      .string()
      .describe(
        "If-Thenプラン（例: もし朝起きたら、すぐにストレッチマットを敷く）"
      ),
    frequency: z
      .enum(["daily", "weekdays", "weekends"])
      .describe("実行頻度"),
  }),
});

export type SessionSummary = z.infer<typeof sessionSummarySchema>;

// ============================================================================
// System Prompt
// ============================================================================

const SUMMARY_SYSTEM_PROMPT = `あなたはプロのライフコーチです。コーチングセッションの全会話を分析し、構造化されたサマリーを生成してください。

## 重要な区別

### 目標（goal）
ユーザーが達成したい状態・結果です。
例: 「健康的な体を手に入れたい」「英語でプレゼンできるようになりたい」

### 習慣（habitSuggestion）
目標達成のために**毎日繰り返す具体的な行動**です。目標そのものではありません。
- 良い例: 「朝10分ストレッチする」「英単語を5個覚える」「日記を3行書く」
- 悪い例: 「健康になる」「英語を上達させる」（これらは目標であり習慣ではない）

## 習慣設計のガイドライン

### 2分ルール
新しい習慣は2分以内で完了できるバージョンから始めます。
- 「30分ランニング」→ 2分版: 「ランニングシューズを履く」
- 「毎日読書」→ 2分版: 「本を開いて1ページ読む」

### 習慣スタッキング（トリガー設定）
既存の習慣の後に新しい習慣を紐づけます。
- 「朝コーヒーを淹れた後に」
- 「歯を磨いた後に」
- 「昼食後に」

### If-Thenプラン
「もし〜したら、〜する」の形式で具体的な実行計画を立てます。
- 「もし朝起きたら、すぐにストレッチマットを敷く」
- 「もし電車に乗ったら、英単語アプリを開く」

### カテゴリ判断基準
- health: 運動、食事、睡眠、メンタルヘルスなど身心の健康に関するもの
- learning: 勉強、読書、スキル習得など学びに関するもの
- work: 仕事の効率化、キャリア、タスク管理に関するもの
- life: 人間関係、趣味、生活習慣、家事に関するもの
- other: 上記に当てはまらないもの

### 頻度の判断
- daily: 毎日実行するのが望ましい習慣（デフォルト）
- weekdays: 仕事や学習関連で平日のみ行う習慣
- weekends: 週末にまとまった時間を使う習慣

## 出力の注意点
- セッション内容に基づいた具体的で個別化された内容にしてください
- 定型文や一般論ではなく、実際の会話内容を反映してください
- 強みは会話中に実際に見られた具体的な特性を挙げてください
- coachMessageは温かみがありつつ、次のアクションへの動機付けとなるものにしてください`;

// ============================================================================
// Mock Response
// ============================================================================

function generateMockSummary(): SessionSummary {
  return {
    theme: "自己成長と目標設定",
    goal: "日々の生活をより充実させたい",
    currentState: "改善の意欲があり、具体的な行動を模索している段階",
    strengths: ["自己分析力", "行動する意欲", "素直さ"],
    actionItems: [
      "毎朝5分の振り返り時間を設ける",
      "小さな成功体験を記録する",
      "週に1回、進捗を確認する",
    ],
    coachMessage:
      "今日のセッションでは、あなたの前向きな姿勢がとても印象的でした。小さな一歩から始めることで、大きな変化につながります。まずは明日の朝から、最初のアクションを試してみましょう！",
    habitSuggestion: {
      name: "朝5分の振り返りジャーナルを書く",
      description:
        "毎朝の振り返りを習慣にすることで、自分の成長を実感し、日々の行動に意識を向けることができます。",
      category: "life",
      twoMinuteVersion: "ノートを開いて今日の目標を1つ書く",
      trigger: "朝コーヒーを淹れた後に",
      ifThenPlan:
        "もし朝コーヒーを淹れたら、テーブルに座ってノートを開く",
      frequency: "daily",
    },
  };
}

// ============================================================================
// Summary Generation
// ============================================================================

/**
 * セッションの全メッセージからAIによる構造化サマリーを生成する
 */
export async function generateSessionSummary(
  messages: Array<{ role: string; content: string }>
): Promise<SessionSummary> {
  const openai = getOpenAIProvider();

  if (!openai) {
    return generateMockSummary();
  }

  const conversationText = messages
    .map((m) => `${m.role === "user" ? "ユーザー" : "コーチ"}: ${m.content}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: openai(OPENAI_MODELS.GPT5_2),
    schema: sessionSummarySchema,
    system: SUMMARY_SYSTEM_PROMPT,
    prompt: `以下のコーチングセッションの会話を分析し、構造化されたサマリーと習慣提案を生成してください。\n\n---\n\n${conversationText}`,
    temperature: 0.3,
  });

  return object;
}
