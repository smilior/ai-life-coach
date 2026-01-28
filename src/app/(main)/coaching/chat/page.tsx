"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import {
  ChatMessage,
  ChatInput,
  TypingIndicator,
  SessionProgressCompact,
  type ChatMessageData,
} from "@/components/features/coaching";
import type { CoachingStep } from "@/types/ai";

/**
 * コーチングチャット画面
 * - AIとのリアルタイム対話
 * - ストリーミング応答UI
 * - 9ステップ進捗表示
 * - モバイルファーストレイアウト
 */
export default function CoachingChatPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        "こんにちは！AIライフコーチです。\n\n今日はどんなことについて話しましょうか？\n目標に向けた進捗や、最近感じていることなど、なんでも気軽に話してくださいね。",
      timestamp: new Date(),
      step: 1,
    },
  ]);
  const [currentStep, setCurrentStep] = useState<CoachingStep>(1);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  // メッセージ追加時に自動スクロール
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /**
   * メッセージ送信ハンドラ
   * - ユーザーメッセージを追加
   * - AIの応答をストリーミングシミュレーション
   */
  const handleSend = useCallback(
    async (content: string) => {
      // ユーザーメッセージの追加
      const userMessage: ChatMessageData = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // タイピングインジケーター表示
      setIsTyping(true);

      // AIの応答をシミュレート（実際のAPI接続時に置き換え）
      try {
        const response = await simulateAIResponse(content, currentStep);

        setIsTyping(false);

        const assistantMessageId = `assistant-${Date.now()}`;
        setStreamingMessageId(assistantMessageId);

        // ストリーミング表示のシミュレーション
        const fullText = response.message;
        let displayedText = "";

        const assistantMessage: ChatMessageData = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          step: response.nextStep || currentStep,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // 文字を逐次表示
        for (let i = 0; i < fullText.length; i++) {
          displayedText += fullText[i];
          const currentText = displayedText;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: currentText }
                : msg
            )
          );
          // 句読点の後は少し長めのディレイ
          const isPunctuation = /[。！？\n]/.test(fullText[i]);
          await delay(isPunctuation ? 60 : 20);
        }

        setStreamingMessageId(null);

        // ステップを進める
        if (response.nextStep) {
          setCurrentStep(response.nextStep);
        }
      } catch {
        setIsTyping(false);
        setStreamingMessageId(null);

        // エラーメッセージを表示
        const errorMessage: ChatMessageData = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "申し訳ありません。一時的にエラーが発生しました。もう一度お試しください。",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [currentStep]
  );

  const isInputDisabled = isTyping || streamingMessageId !== null;

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col">
      {/* ヘッダー */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -ml-2"
              onClick={() => router.push("/coaching")}
              aria-label="戻る"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                AI
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm">AIコーチ</h1>
              <SessionProgressCompact currentStep={currentStep} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="メニュー"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* メッセージエリア */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth scrollbar-hide"
      >
        <div className="space-y-4 p-4">
          {/* 進捗バー */}
          <div className="flex justify-center">
            <div className="bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground">
              セッション開始
            </div>
          </div>

          {/* メッセージ一覧 */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={message.id === streamingMessageId}
            />
          ))}

          {/* タイピングインジケーター */}
          {isTyping && <TypingIndicator />}

          {/* スクロール追従用のアンカー */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力エリア */}
      <ChatInput onSend={handleSend} disabled={isInputDisabled} />
    </div>
  );
}

/**
 * AI応答のシミュレーション
 * 実際のAPI連携時にはここをfetch/streamに置き換える
 */
async function simulateAIResponse(
  userMessage: string,
  currentStep: CoachingStep
): Promise<{ message: string; nextStep?: CoachingStep }> {
  await delay(800 + Math.random() * 700);

  const responses: Record<number, { message: string; nextStep?: CoachingStep }> =
    {
      1: {
        message: `${userMessage.includes("仕事") ? "仕事のことで悩んでいるんですね。" : "そうなんですね。"}お話しくださりありがとうございます。\n\nその状況は大変ですよね。あなたの気持ち、よくわかります。\n\nもし今の状況が理想的に解決したとしたら、どんな状態になっていますか？具体的にイメージしてみてください。`,
        nextStep: 2,
      },
      2: {
        message:
          "素敵なビジョンですね！\n\nそのような理想の状態に向けて、別の見方をしてみましょう。今の経験は、実はあなたの成長にとって大切なステップなのかもしれません。\n\n10点を理想の状態として、今は何点くらいだと感じますか？",
        nextStep: 3,
      },
      3: {
        message:
          "なるほど、ありがとうございます。\n\n最近、少しでもうまくいった時はありましたか？小さなことでも構いません。\n\nうまくいった時のことを教えていただけると、あなたの強みが見えてくるかもしれません。",
        nextStep: 4,
      },
      4: {
        message:
          "それは素晴らしいですね！既にそういった経験があるということは、あなたには乗り越える力があるということです。\n\nお話を聞いていて、**粘り強さ**と**前向きに取り組む姿勢**という強みを感じました。\n\nこの強みを活かして、いくつかの選択肢を考えてみましょう。",
        nextStep: 5,
      },
      5: {
        message:
          "いくつかのアプローチがありそうですね。\n\n**選択肢1**: 毎朝5分だけ、優先事項を整理する\n**選択肢2**: 週の初めに30分、計画を立てる時間を確保する\n**選択肢3**: 信頼できる人に相談して、サポートを得る\n\nどれが一番しっくりきますか？他にも思いつくものがあれば教えてください。",
        nextStep: 6,
      },
      6: {
        message:
          "いい選択ですね！\n\nでは、その最初の一歩を**2分で始められる形**にしてみましょう。\n\n明日の朝、最初にできる小さなアクションは何ですか？\n\n例えば「スマホのメモを開いて、今日やることを1つだけ書く」のような、本当に小さなことで大丈夫ですよ。",
        nextStep: 7,
      },
      7: {
        message:
          "素晴らしいですね！それなら無理なく続けられそうです。\n\n今日のセッションをまとめると...\n\n**あなたの強み**: 粘り強さ、前向きな姿勢\n**次のアクション**: 明日の朝から始めてみましょう\n\nあなたならきっとできます。小さな一歩を大切にしていきましょう。\n\nまた話したくなったら、いつでも声をかけてくださいね。",
        nextStep: 8,
      },
      8: {
        message:
          "今日のセッション、とても実りのある時間でしたね！\n\nあなたが自分自身と向き合い、一歩を踏み出そうとしていること自体が、大きな前進です。\n\nこの目標を習慣として登録しますか？日々のリマインドで、継続をサポートできますよ。",
        nextStep: 9,
      },
      9: {
        message:
          "わかりました！\n\nいつでもまた話しかけてくださいね。あなたの成長を応援しています。\n\n素敵な一日をお過ごしください。",
      },
    };

  return responses[currentStep] || responses[1];
}

/**
 * ディレイユーティリティ
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
