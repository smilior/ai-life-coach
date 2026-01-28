import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | AI Life Coach",
  description:
    "AI Life Coachにログインして、あなただけの成長ストーリーを始めましょう。毎日2分から始められるパーソナルコーチング。",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
