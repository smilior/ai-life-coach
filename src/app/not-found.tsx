import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* 404 illustration */}
      <div className="mb-8">
        <svg
          width="120"
          height="80"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto text-muted-foreground"
        >
          {/* "4" left */}
          <text
            x="10"
            y="60"
            fontSize="48"
            fontWeight="bold"
            fill="currentColor"
            opacity="0.3"
          >
            4
          </text>
          {/* Compass circle for "0" */}
          <circle
            cx="60"
            cy="40"
            r="24"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.3"
          />
          <circle cx="60" cy="40" r="3" fill="currentColor" opacity="0.5" />
          <line
            x1="60"
            y1="40"
            x2="60"
            y2="22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <line
            x1="60"
            y1="40"
            x2="72"
            y2="48"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* "4" right */}
          <text
            x="88"
            y="60"
            fontSize="48"
            fontWeight="bold"
            fill="currentColor"
            opacity="0.3"
          >
            4
          </text>
        </svg>
      </div>

      <h1 className="mb-3 text-2xl font-bold text-foreground">
        ページが見つかりません
      </h1>

      <p className="mb-8 max-w-sm text-base text-muted-foreground">
        お探しのページは移動または削除された可能性があります。
        <br />
        URLが正しいかご確認ください。
      </p>

      <Link
        href="/dashboard"
        className="touch-target inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
