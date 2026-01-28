"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { LogOut } from "lucide-react";

export function AccountSection() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      // TODO: Implement actual account deletion API
      await signOut();
      router.push("/");
    } catch {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">アカウント</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {/* ログアウト */}
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-3 px-3 py-3 text-sm font-normal"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
          <span>{isLoggingOut ? "ログアウト中..." : "ログアウト"}</span>
        </Button>

        {/* アカウント削除 */}
        <DeleteAccountDialog
          onConfirm={handleDeleteAccount}
          isLoading={isDeletingAccount}
        />
      </CardContent>
    </Card>
  );
}
