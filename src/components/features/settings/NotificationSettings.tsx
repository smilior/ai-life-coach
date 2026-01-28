"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Clock, MessageCircle } from "lucide-react";

interface NotificationSettingsProps {
  habitReminder: boolean;
  reminderTime: string;
  coachingNotification: boolean;
  onHabitReminderChange: (value: boolean) => void;
  onReminderTimeChange: (value: string) => void;
  onCoachingNotificationChange: (value: boolean) => void;
}

export function NotificationSettings({
  habitReminder,
  reminderTime,
  coachingNotification,
  onHabitReminderChange,
  onReminderTimeChange,
  onCoachingNotificationChange,
}: NotificationSettingsProps) {
  const [localReminderTime, setLocalReminderTime] = useState(reminderTime);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalReminderTime(value);
    onReminderTimeChange(value);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">通知設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 習慣リマインダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="habit-reminder" className="cursor-pointer">
              習慣リマインダー
            </Label>
          </div>
          <Switch
            id="habit-reminder"
            checked={habitReminder}
            onCheckedChange={onHabitReminderChange}
          />
        </div>

        {/* リマインド時刻 */}
        {habitReminder && (
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reminder-time" className="cursor-pointer text-sm">
                リマインド時刻
              </Label>
            </div>
            <input
              id="reminder-time"
              type="time"
              value={localReminderTime}
              onChange={handleTimeChange}
              className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            />
          </div>
        )}

        {/* コーチングセッション通知 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="coaching-notification" className="cursor-pointer">
              コーチング通知
            </Label>
          </div>
          <Switch
            id="coaching-notification"
            checked={coachingNotification}
            onCheckedChange={onCoachingNotificationChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
