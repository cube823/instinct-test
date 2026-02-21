import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://instinct-test.pages.dev"),
  title: "본능 테스트 - 나는 생존형? 번식형?",
  description: "생존 본능과 번식 본능, 당신은 어느 쪽에 더 가까운가요? 20개 질문으로 알아보는 나의 본능 유형",
  openGraph: {
    title: "본능 테스트 - 나는 생존형? 번식형?",
    description: "생존 본능과 번식 본능, 당신은 어느 쪽에 더 가까운가요? 20개 질문으로 알아보는 나의 본능 유형",
    type: "website",
    images: [{ url: "/og/default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "본능 테스트 - 나는 생존형? 번식형?",
    description: "생존 본능과 번식 본능, 당신은 어느 쪽에 더 가까운가요? 20개 질문으로 알아보는 나의 본능 유형",
    images: ["/og/default.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-geist-sans), Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
      >
        {children}
        <script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          integrity="sha384-DKYJZ8NLiK8MN4/C5P2ezmFnkrWAhBXDAQ/5eQ27GbOl5bFJKyXvSBRoHYNWKeZ"
          crossOrigin="anonymous"
          async
        />
      </body>
    </html>
  );
}
