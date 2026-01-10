/**
 * Hook for managing roles
 */
"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getRoles, Role } from "@/lib/memberService";

interface UseRolesReturn {
    roles: Role[];
    loading: boolean;
    error: string | null;
    fetchRoles: () => Promise<void>;
}

export function useRoles(): UseRolesReturn {
    const { getToken } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            const data = await getRoles(token);
            setRoles(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch roles";
            setError(errorMessage);
            console.error("Error fetching roles:", err);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    return {
        roles,
        loading,
        error,
        fetchRoles,
    };
}
