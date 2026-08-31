import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['uz', 'en', 'ru'];
const defaultLocale = 'uz';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip next internal files, api routes, and static assets with extensions
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Check if pathname already starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 3. Redirect to default locale (e.g. / -> /uz, /dashboard -> /uz/dashboard)
  request.nextUrl.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Official Next.js matcher pattern (no unsupported regex anchors or non-capturing groups)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
