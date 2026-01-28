import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | AIライフコーチ",
  description: "AIライフコーチにログインして、あなたの成長をサポートします。",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            おかえりなさい
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AIライフコーチにログインして、あなたの成長をサポートします。
          </p>
        </div>
        {/* ログインフォームはここに実装 */}
      </div>
    </main>
  );
}
