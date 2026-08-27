'use client';

import * as React from 'react';
import { ThemeProvider } from '@/lib/theme';
import { LangProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth-context';

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
