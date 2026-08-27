import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['uz', 'en', 'ru'];
const defaultLocale = 'uz';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignore static assets with extensions (e.g. /logo.png)
  if (pathname.includes('.')) {
    return;
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static assets
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$).*)',
  ],
};
