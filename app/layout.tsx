import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.PAGES_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "M-POINT | 麻雀点数卓",
  description: "4人麻雀の点数表示・点数移動を、卓の中央で。",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: { icon: `${basePath}/favicon.svg`, apple: `${basePath}/icon-192.svg` },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "M-POINT" },
};

export const viewport: Viewport = {
  themeColor: "#071a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
