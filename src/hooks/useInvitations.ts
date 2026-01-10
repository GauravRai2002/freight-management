"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";

interface OrganizationInvitation {
    id: string;
    email: string;
    expiresAt: string;
    createdAt: string;
    role: {
        id: string;
        name: string;
        description: string;
    };
    organization: {
        id: string;
        name: string;
        slug: string;
        imageUrl?: string;
    };
}

interface InvitationsResponse {
    email: string;
    invitations: OrganizationInvitation[];
    count: number;
}

export function useInvitations() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvitations = useCallback(async () => {
        if (!isLoaded || !isSignedIn) {
            console.log("[useInvitations] Auth not ready");
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                console.error("[useInvitations] No auth token available");
                setError("Not authenticated");
                return null;
            }

            // This endpoint only needs authorization, not x-organization-id
            const data = await api.get<InvitationsResponse>("/api/auth/my-invitations", { token });
            setInvitations(data.invitations);
            console.log("[useInvitations] Fetched invitations:", data.count);
            return data;
        } catch (err) {
            console.error("[useInvitations] Failed to fetch invitations:", err);
            setError("Failed to load invitations");
            return null;
        } finally {
            setLoading(false);
        }
    }, [getToken, isLoaded, isSignedIn]);

    return {
        invitations,
        loading,
        error,
        fetchInvitations,
        isReady: isLoaded && isSignedIn,
    };
}
