import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ai-life-coach.vercel.app"
  ),
  title: {
    default: "AIライフコーチ",
    template: "%s | AIライフコーチ",
  },
  description:
    "AIコーチとの対話で、あなたの目標達成と習慣形成をサポート。2分から始まる、あなただけの成長ストーリー。",
  keywords: [
    "ライフコーチング",
    "AI",
    "習慣形成",
    "目標達成",
    "自己成長",
    "メンタルヘルス",
  ],
  authors: [{ name: "AI Life Coach Team" }],
  creator: "AI Life Coach",
  publisher: "AI Life Coach",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "AIライフコーチ",
    title: "AIライフコーチ",
    description:
      "AIコーチとの対話で、あなたの目標達成と習慣形成をサポート。2分から始まる、あなただけの成長ストーリー。",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "AI Life Coach",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIライフコーチ",
    description:
      "AIコーチとの対話で、あなたの目標達成と習慣形成をサポート。",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AIライフコーチ",
    startupImage: [
      {
        url: "/icons/icon-512.png",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.svg", sizes: "180x180" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Noto Sans JP - Google Fonts (loaded via CSS) */}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
