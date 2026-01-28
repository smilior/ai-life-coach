"use client";

import { useRef, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * チャット入力コンポーネント
 * - テキストエリア + 送信ボタン
 * - Enter で送信、Shift+Enter で改行
 * - モバイルファースト: 画面下部固定レイアウト用
 * - safe-area-bottom 対応
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "メッセージを入力...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");

    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter で送信、Shift+Enter で改行
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);

      // テキストエリアの高さを自動調整（最大5行分）
      const textarea = e.target;
      textarea.style.height = "auto";
      const maxHeight = 5 * 24; // 5行分 approximately
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    },
    []
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t bg-background p-3 safe-area-inset-bottom">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-[120px] resize-none text-base"
          aria-label="メッセージ入力"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          className="shrink-0 h-[44px] w-[44px] touch-target"
          aria-label="送信"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
