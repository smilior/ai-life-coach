"use client";

import Link from "next/link";
import { Sparkles, Clock, Heart } from "lucide-react";
import { LoginButton } from "@/components/auth/LoginButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 py-8 safe-area-inset-top safe-area-inset-bottom">
      {/* Header */}
      <div className="w-full max-w-md text-center space-y-4 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 pt-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            AI Life Coach
          </h1>
        </div>

        {/* Catchphrase */}
        <p className="text-muted-foreground text-lg">
          2分から始まる、あなただけの成長ストーリー
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        {/* Features */}
        <div className="space-y-4">
          <FeatureItem
            icon={<Clock className="w-5 h-5 text-primary" />}
            title="毎日2分のチェックイン"
            description="短い時間で継続できる習慣づくり"
          />
          <FeatureItem
            icon={<Sparkles className="w-5 h-5 text-secondary" />}
            title="AIによるパーソナルコーチング"
            description="あなたに合わせたアドバイスをお届け"
          />
          <FeatureItem
            icon={<Heart className="w-5 h-5 text-success" />}
            title="成長を可視化"
            description="達成感が続くモチベーション管理"
          />
        </div>

        {/* Login Section */}
        <div className="space-y-4">
          <LoginButton />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">または</span>
            <Separator className="flex-1" />
          </div>

          {/* Guest Mode */}
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            asChild
          >
            <Link href="/onboarding/welcome?guest=true">
              ゲストとして試す
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md text-center pb-4">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Button variant="link" size="sm" className="text-muted-foreground h-auto p-0" asChild>
            <Link href="/terms">利用規約</Link>
          </Button>
          <span className="text-muted-foreground">・</span>
          <Button variant="link" size="sm" className="text-muted-foreground h-auto p-0" asChild>
            <Link href="/privacy">プライバシーポリシー</Link>
          </Button>
        </div>
      </footer>
    </main>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
