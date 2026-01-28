"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      ログアウト
    </Button>
  );
}
