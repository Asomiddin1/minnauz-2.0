import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/lib/theme";
import { LangProvider, type Lang } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "MinnaUz | JLPT",
  description: "Yapon tilini o'rgatuvchi platforma",
  referrer: 'no-referrer-when-downgrade',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const validLocale: Lang = ['uz', 'ru', 'en', 'ja', 'jp'].includes(locale)
    ? (locale === 'jp' ? 'ja' : (locale as Lang))
    : 'uz';
  
  return (
    <html lang={validLocale} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <NextTopLoader
          color="#0071e3"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0071e3,0 0 5px #0071e3"
          zIndex={99999}
        />
        <ThemeProvider>
          <LangProvider initialLang={validLocale}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
