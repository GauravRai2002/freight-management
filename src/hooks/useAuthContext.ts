/**
 * Hook for getting auth context (token and orgId) for API calls
 */
"use client";

import { useAuth, useOrganization } from "@clerk/nextjs";
import { useCallback } from "react";

interface AuthContext {
    token: string;
    orgId: string;
}

export function useAuthContext() {
    const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
    const { organization, isLoaded: orgLoaded } = useOrganization();

    const getAuthContext = useCallback(async (): Promise<AuthContext | null> => {
        try {
            // Wait a bit if auth/org is still loading
            if (!authLoaded || !orgLoaded) {
                console.log("[useAuthContext] Auth or org not loaded yet, authLoaded:", authLoaded, "orgLoaded:", orgLoaded);
                return null;
            }

            if (!isSignedIn) {
                console.log("[useAuthContext] User not signed in");
                return null;
            }

            const token = await getToken();
            if (!token) {
                console.error("[useAuthContext] No auth token available");
                return null;
            }

            const orgId = organization?.id;
            if (!orgId) {
                console.error("[useAuthContext] No organization selected, org:", organization);
                return null;
            }

            console.log("[useAuthContext] Auth context ready, orgId:", orgId);
            return { token, orgId };
        } catch (error) {
            console.error("[useAuthContext] Failed to get auth context:", error);
            return null;
        }
    }, [getToken, organization, authLoaded, orgLoaded, isSignedIn]);

    return { getAuthContext, isReady: authLoaded && orgLoaded && isSignedIn };
}
