import type { Metadata } from "next";
import HelpContent from "./HelpContent";

export const metadata: Metadata = {
  title: "ヘルプ | AIライフコーチ",
};

export default function HelpPage() {
  return <HelpContent />;
}
