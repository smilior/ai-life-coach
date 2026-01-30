"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function DailyCheckin() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">デイリーチェックイン</h2>

      {/* コーチングCTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold">AIコーチと話す</h3>
                <p className="text-sm text-muted-foreground">
                  今日の気分や目標について相談しましょう
                </p>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/coaching">コーチングを始める</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
