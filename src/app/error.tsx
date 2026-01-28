"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Error icon */}
      <div className="mb-8">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto text-destructive"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.3"
          />
          <line
            x1="40"
            y1="24"
            x2="40"
            y2="44"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="40" cy="54" r="2.5" fill="currentColor" opacity="0.7" />
        </svg>
      </div>

      <h1 className="mb-3 text-2xl font-bold text-foreground">
        エラーが発生しました
      </h1>

      <p className="mb-8 max-w-sm text-base text-muted-foreground">
        予期しないエラーが発生しました。
        <br />
        しばらく時間をおいてから再度お試しください。
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="touch-target inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          もう一度試す
        </button>

        <a
          href="/dashboard"
          className="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
