/* eslint-disable max-len */
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './lib/service';

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

const slugCache = new Map<string, { success: boolean; message: string; ts: number }>();
const SLUG_CACHE_TTL = 60_000;

async function verifySlug(subdomain: string): Promise<{ success: boolean; message: string }> {
  const cached = slugCache.get(subdomain);
  if (cached && Date.now() - cached.ts < SLUG_CACHE_TTL) {
    return { success: cached.success, message: cached.message };
  }
  const res = await AuthService.slugVerify(subdomain);
  const { success, message } = res?.data as { success: boolean; message: string; error: string[] };
  slugCache.set(subdomain, { success, message, ts: Date.now() });
  return { success, message };
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const session = await getToken({ req, secret: process.env.AUTH_SECRET });
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-href', url.href);
  const hostname = req.headers.get('host') ?? '';
  const hostnameWithoutPort = hostname.split(':')[0];
  const subdomain = hostnameWithoutPort.split('.')[0];

  const buildUrlWithQueryParams = (basePath: string) => {
    const newUrl = new URL(basePath, req.url);
    url.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });
    return newUrl;
  };

  if (subdomain === 'app') {
    if (url.pathname !== '/sign_up') {
      return NextResponse.redirect(buildUrlWithQueryParams('/sign_up'));
    }
    return NextResponse.rewrite(buildUrlWithQueryParams(`/${subdomain}/sign_up`));
  }

  if (subdomain !== 'app' && ((subdomain === 'localhost' || subdomain === 'primeclm' || subdomain.length < 4))) {
    if (subdomain === 'localhost' && (url.pathname.includes('accept-invitation') || url.pathname.includes('accept_invitation'))) {
      const slugFromQuery = url.searchParams.get('slug');
      if (slugFromQuery) {
        return NextResponse.rewrite(buildUrlWithQueryParams(`/${slugFromQuery}${url.pathname}`));
      }
    }
    return NextResponse.rewrite(buildUrlWithQueryParams(`/${subdomain}/`));
  }
  const { success, message } = await verifySlug(subdomain);

  const unProtectedUrlMatches: RegExp = /^\/(accept_invitation|accept-invitation|reset_password|privacy_policy|forgot_password|update_password|update_password_email_verify|sign_up|terms_of_service|email_verify|invite|sign_in|confirm_account|contracts\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/guest|templates\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/guest)$/;

  if (success) {
    return NextResponse.rewrite(buildUrlWithQueryParams(`/${subdomain}/`));
  }

  if ((url.pathname === '/') && !session) {
    return NextResponse.redirect(buildUrlWithQueryParams('/sign_in'));
  }

  if (url.pathname === '/' && session) {
    return NextResponse.redirect(buildUrlWithQueryParams('/company_profile/company_information'));
  }

  if (url.pathname === '/sign_up') {
    return NextResponse.redirect(buildUrlWithQueryParams('/sign_in'));
  }

  if (url.pathname === '/sign_in' && session === null) {
    return NextResponse.rewrite(buildUrlWithQueryParams(`/${subdomain}/sign_in`));
  }
  if (session !== null) {
    if (
      unProtectedUrlMatches.test(url.pathname)
      && url.pathname !== '/company_profile/company_information'
      && url.pathname !== '/dashboard'
    ) {
      return NextResponse.redirect(buildUrlWithQueryParams('/sign_in'));
    }
    return NextResponse.rewrite(buildUrlWithQueryParams(`/${subdomain}${url.pathname}`));
  }

  if (!session && unProtectedUrlMatches.test(url.pathname)) {
    return NextResponse.rewrite(buildUrlWithQueryParams(`/${subdomain}${url.pathname}`));
  }

  if (message === 'Slug not available') {
    return NextResponse.rewrite(buildUrlWithQueryParams(`/${subdomain}${url.pathname}`));
  }

  return NextResponse.next();
}
