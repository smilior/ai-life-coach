"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, MoreVertical, CheckCircle2 } from "lucide-react";
import {
  ChatMessage,
  ChatInput,
  TypingIndicator,
  SessionProgressCompact,
  type ChatMessageData,
} from "@/components/features/coaching";
import type { CoachingStep } from "@/types/ai";

const INITIAL_GREETING: ChatMessageData = {
  id: "initial",
  role: "assistant",
  content:
    "こんにちは！AIライフコーチです。\n\n今日はどんなことについて話しましょうか？\n目標に向けた進捗や、最近感じていることなど、なんでも気軽に話してくださいね。",
  timestamp: new Date(),
  step: 1,
};

/**
 * コーチングチャット画面
 * - AIとのリアルタイム対話
 * - ストリーミング応答UI
 * - 9ステップ進捗表示
 * - モバイルファーストレイアウト
 * - セッション再開対応（?session=パラメータ）
 */
export default function CoachingChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <CoachingChatContent />
    </Suspense>
  );
}

function ChatLoadingFallback() {
  return (
    <div className="flex h-[calc(100dvh-5rem)] items-center justify-center">
      <p className="text-sm text-muted-foreground">読み込み中...</p>
    </div>
  );
}

function CoachingChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingSessionId = searchParams.get("session");

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [currentStep, setCurrentStep] = useState<CoachingStep>(1);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const sessionInitRef = useRef(false);

  // セッション初期化（既存セッション読み込み or 新規作成）
  useEffect(() => {
    if (sessionInitRef.current) return;
    sessionInitRef.current = true;

    async function initSession() {
      try {
        if (existingSessionId) {
          // 既存セッションを読み込む
          const res = await fetch(
            `/api/coaching/sessions/${existingSessionId}`
          );
          if (res.ok) {
            const json = await res.json();
            const session = json.data;
            setSessionId(session.id);
            setCurrentStep(
              (session.currentStep as CoachingStep) || 1
            );

            // DB のメッセージ履歴を反映
            if (session.messages && session.messages.length > 0) {
              const loadedMessages: ChatMessageData[] =
                session.messages.map(
                  (m: {
                    id: string;
                    role: string;
                    content: string;
                    step: number | null;
                    createdAt: string;
                  }) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    timestamp: new Date(m.createdAt),
                    step: m.step ?? undefined,
                  })
                );
              setMessages(loadedMessages);
            } else {
              // メッセージがない既存セッションの場合は挨拶を表示
              setMessages([INITIAL_GREETING]);
            }
          } else {
            // セッション取得失敗時は新規作成にフォールバック
            console.error(
              "Failed to load session, creating new:",
              res.status
            );
            await createNewSession();
          }
        } else {
          // 新規セッション作成
          await createNewSession();
        }
      } catch (err) {
        console.error("Failed to init session:", err);
      } finally {
        setIsLoadingSession(false);
      }
    }

    async function createNewSession() {
      const res = await fetch("/api/coaching/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionType: "free" }),
      });
      if (res.ok) {
        const json = await res.json();
        setSessionId(json.data.id);
        setMessages([INITIAL_GREETING]);
      } else {
        console.error("Failed to create session:", res.status);
      }
    }

    initSession();
  }, [existingSessionId]);

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
   * - AIの応答をストリーミング表示
   */
  const handleSend = useCallback(
    async (content: string) => {
      if (!sessionId) return;

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

      try {
        const res = await fetch("/api/coaching/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            message: content,
            step: currentStep,
          }),
        });

        setIsTyping(false);

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const assistantMessageId = `assistant-${Date.now()}`;
        setStreamingMessageId(assistantMessageId);

        // アシスタントメッセージの枠を追加
        const assistantMessage: ChatMessageData = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          step: currentStep,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // JSON応答（モック）の場合
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: json.message }
                : msg
            )
          );
          setStreamingMessageId(null);
          if (json.step) {
            setCurrentStep(json.step as CoachingStep);
          }
          // 自動終了シグナル検知
          if (json.shouldEndSession) {
            setIsSessionEnded(true);
            setTimeout(() => {
              router.push(`/coaching/summary/${sessionId}`);
            }, 3000);
          }
          return;
        }

        // ストリーミング応答の処理
        const sessionEndHeader = res.headers.get("X-Session-End");
        const nextStepHeader = res.headers.get("X-Next-Step");
        if (nextStepHeader) {
          const nextStep = parseInt(nextStepHeader, 10);
          if (nextStep >= 1 && nextStep <= 9) {
            setCurrentStep(nextStep as CoachingStep);
          }
        }
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          const currentText = fullText;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: currentText }
                : msg
            )
          );
        }

        setStreamingMessageId(null);

        // 自動終了シグナル検知（ストリーミング）
        if (sessionEndHeader === "true") {
          setIsSessionEnded(true);
          setTimeout(() => {
            router.push(`/coaching/summary/${sessionId}`);
          }, 3000);
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
    [currentStep, sessionId, router]
  );

  // 手動セッション終了ハンドラ
  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    setIsEnding(true);
    try {
      const res = await fetch(`/api/coaching/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (res.ok) {
        setShowEndDialog(false);
        router.push(`/coaching/summary/${sessionId}`);
      }
    } catch (err) {
      console.error("Failed to end session:", err);
    } finally {
      setIsEnding(false);
    }
  }, [sessionId, router]);

  const isInputDisabled =
    isTyping || streamingMessageId !== null || !sessionId || isLoadingSession || isSessionEnded;

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
            onClick={() => setShowEndDialog(true)}
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
              {existingSessionId ? "セッション再開" : "セッション開始"}
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

      {/* 入力エリア or 完了バナー */}
      {isSessionEnded ? (
        <div className="border-t bg-muted/50 p-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium text-sm">セッションが完了しました</span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push(`/coaching/summary/${sessionId}`)}
            >
              サマリーを見る
            </Button>
          </div>
        </div>
      ) : (
        <ChatInput onSend={handleSend} disabled={isInputDisabled} />
      )}

      {/* セッション終了確認ダイアログ */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>セッションを終了しますか？</DialogTitle>
            <DialogDescription>
              現在のセッションを終了して、サマリーページに移動します。終了後はこのセッションに新しいメッセージを送ることはできません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEndDialog(false)}
              disabled={isEnding}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndSession}
              disabled={isEnding}
            >
              {isEnding ? "終了中..." : "セッションを終了"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

