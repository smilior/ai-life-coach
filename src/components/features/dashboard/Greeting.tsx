"use client";

import { useState, useEffect } from "react";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "おはようございます";
  if (hour >= 12 && hour < 18) return "こんにちは";
  return "こんばんは";
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}

interface GreetingProps {
  nickname?: string;
}

export function Greeting({ nickname = "ユーザー" }: GreetingProps) {
  const [greeting, setGreeting] = useState("こんにちは");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours()));
    setDateString(formatDate(now));
  }, []);

  return (
    <section className="space-y-1">
      <h1 className="text-2xl font-bold">
        {greeting}、{nickname}さん
      </h1>
      <p className="text-sm text-muted-foreground">{dateString}</p>
    </section>
  );
}
