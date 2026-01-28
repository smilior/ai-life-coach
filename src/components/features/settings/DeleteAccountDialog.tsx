"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface DeleteAccountDialogProps {
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteAccountDialog({
  onConfirm,
  isLoading = false,
}: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isConfirmed = confirmText === "削除";

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setOpen(false);
      setConfirmText("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmText("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-destructive transition-colors hover:bg-destructive/10">
          <Trash2 className="h-5 w-5" />
          <span>アカウント削除</span>
        </button>
      </DialogTrigger>
      <DialogContent className="mx-4 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            アカウントを削除しますか？
          </DialogTitle>
          <DialogDescription className="text-left">
            この操作は取り消せません。すべてのデータ（習慣、コーチング履歴、進捗記録）が完全に削除されます。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="delete-confirm" className="text-sm">
            確認のため「削除」と入力してください
          </Label>
          <Input
            id="delete-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="削除"
            className="text-sm"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
          >
            {isLoading ? "削除中..." : "アカウントを削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
