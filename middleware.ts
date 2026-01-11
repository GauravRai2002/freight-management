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

    // Auth routes (sign-in, sign-up) - redirect if already authenticated
    if (isPublicRoute(req) && !req.nextUrl.pathname.startsWith('/api/')) {
        const { userId, orgId } = await auth();

        if (userId) {
            // Already logged in - redirect to appropriate page
            if (orgId) {
                return NextResponse.redirect(new URL('/', req.url));
            } else {
                return NextResponse.redirect(new URL('/onboarding', req.url));
            }
        }
        return NextResponse.next();
    }

    // API webhooks - no auth required
    if (req.nextUrl.pathname.startsWith('/api/webhooks')) {
        return NextResponse.next();
    }

    // For onboarding route, check auth without forcing redirect
    // This allows newly signed-up users to access onboarding while session is being established
    if (isOnboardingRoute(req)) {
        const { userId, orgId } = await auth();

        // If user has an organization, redirect to dashboard
        if (orgId) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        // Allow access to onboarding (authenticated or during session establishment)
        return NextResponse.next();
    }

    // Protect all non-public routes - this will redirect to sign-in if not authenticated
    const authObject = await auth.protect();

    console.log(`[Middleware] After protect - userId: ${authObject.userId}, orgId: ${authObject.orgId}`);

    // Signed in but no organization - redirect to onboarding (unless already there)
    if (!authObject.orgId) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
