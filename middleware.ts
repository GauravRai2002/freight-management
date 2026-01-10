import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
]);

const isOnboardingRoute = createRouteMatcher([
    '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    console.log(`[Middleware] Request to: ${req.nextUrl.pathname}`);

    // Public routes - no auth required
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // Protect all non-public routes - this will redirect to sign-in if not authenticated
    const authObject = await auth.protect();

    console.log(`[Middleware] After protect - userId: ${authObject.userId}, orgId: ${authObject.orgId}`);

    // Signed in but no organization - redirect to onboarding (unless already there)
    if (!authObject.orgId && !isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Has organization but on onboarding page - redirect to dashboard
    if (authObject.orgId && isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
