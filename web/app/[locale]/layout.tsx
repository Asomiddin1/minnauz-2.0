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
import { LangProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";

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
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <LangProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
