"use client";

import { useEffect } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { isLoaded: orgLoaded, organization } = useOrganization();
    const router = useRouter();

    useEffect(() => {
        if (!authLoaded || !orgLoaded) return;

        // Not signed in - redirect to sign-in
        if (!isSignedIn) {
            router.replace("/sign-in");
            return;
        }

        // Signed in but no organization - redirect to onboarding
        if (!organization) {
            router.replace("/onboarding");
            return;
        }
    }, [authLoaded, orgLoaded, isSignedIn, organization, router]);

    // Show loading while checking auth
    if (!authLoaded || !orgLoaded) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Not signed in or no organization - show loading until redirect happens
    if (!isSignedIn || !organization) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <>{children}</>;
}
