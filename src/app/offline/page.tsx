"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Reload after a brief delay to ensure connectivity is stable
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Offline icon */}
      <div className="mb-8">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto text-muted-foreground"
        >
          <circle
            cx="40"
            cy="40"
            r="38"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.4"
          />
          <path
            d="M24 44C24 44 30 36 40 36C50 36 56 44 56 44"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M30 50C30 50 34 44 40 44C46 44 50 50 50 50"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="40" cy="56" r="3" fill="currentColor" />
          {/* Diagonal line indicating offline */}
          <line
            x1="18"
            y1="62"
            x2="62"
            y2="18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      <h1 className="mb-3 text-2xl font-bold text-foreground">
        オフラインです
      </h1>

      <p className="mb-8 max-w-sm text-base text-muted-foreground">
        インターネット接続を確認してください。
        <br />
        接続が回復すると自動的にページが再読み込みされます。
      </p>

      {isOnline && (
        <p className="mb-4 text-sm text-success">
          接続を検出しました。再読み込み中...
        </p>
      )}

      <button
        onClick={() => window.location.reload()}
        className="touch-target inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        再試行
      </button>
    </div>
  );
}
