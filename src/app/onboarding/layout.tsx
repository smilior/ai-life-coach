import { Metadata } from "next";
import { OnboardingProvider } from "@/components/features/onboarding";

export const metadata: Metadata = {
  title: {
    template: "%s | AIライフコーチ",
    default: "はじめましょう | AIライフコーチ",
  },
  description: "AIライフコーチへようこそ。あなただけの成長プランを作成しましょう。",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {children}
      </div>
    </OnboardingProvider>
  );
}
