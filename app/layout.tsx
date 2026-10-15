import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "JobFilter MVP — 핵심기능",
  description: "컴퓨터공학과 맞춤 취업지원 포털 — 핵심기능 시연",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
