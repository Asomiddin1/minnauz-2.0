'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';
import Link from 'next/link';

export default function RootGoogleCallbackPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const { lang, t } = useLang();
  const [error, setError] = React.useState<string | null>(null);

  const savedLang = typeof window !== 'undefined' ? (localStorage.getItem('minna-lang') as string) : null;
  const currentLang = savedLang || lang || 'uz';
  const processedRef = React.useRef(false);

  React.useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processGoogleResponse = async () => {
      try {
        if (typeof window === 'undefined') return;

        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const accessToken = params.get('access_token');

        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromQuery = queryParams.get('id_token') || queryParams.get('access_token') || queryParams.get('credential');

        const token = idToken || accessToken || tokenFromQuery;

        if (!token) {
          throw new Error("Google hisobidan tasdiqlash ma'lumotlari olinmadi.");
        }

        await loginWithGoogle(token);
        router.replace(`/${currentLang}/dashboard`);
      } catch (err: any) {
        console.error('Google auth callback error:', err);
        setError(err.message || "Google orqali kirishda xatolik yuz berdi.");
      }
    };

    processGoogleResponse();
  }, [loginWithGoogle, router, currentLang]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm rounded-[28px] border border-border bg-card p-8 text-center shadow-md">
        {error ? (
          <div className="space-y-4">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive text-xl font-bold">
              ✕
            </div>
            <h2 className="headline text-[20px] font-semibold text-foreground">
              {t?.auth?.callbackError || "Kirishda xatolik"}
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              {error}
            </p>
            <div className="pt-2">
              <Link
                href={`/${currentLang}/auth/login`}
                className="inline-flex items-center justify-center rounded-full bg-[#0071e3] px-6 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t?.auth?.backToLogin || "Login sahifasiga qaytish"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-[#0071e3] border-t-transparent" />
            <h2 className="headline text-[20px] font-semibold text-foreground">
              {t?.auth?.callbackLoading || "Google orqali ulanmoqda..."}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {t?.auth?.callbackChecking || "Sessiyangiz tekshirilmoqda, iltimos kuting"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
