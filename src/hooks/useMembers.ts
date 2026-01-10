/**
 * Hook for managing organization members
 */
"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    getMembers,
    updateMemberRole,
    Member,
} from "@/lib/memberService";

interface UseMembersReturn {
    members: Member[];
    loading: boolean;
    error: string | null;
    fetchMembers: () => Promise<void>;
    changeMemberRole: (memberId: string, roleId: string) => Promise<void>;
}

export function useMembers(): UseMembersReturn {
    const { getToken } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            const data = await getMembers(token);
            setMembers(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch members";
            setError(errorMessage);
            console.error("Error fetching members:", err);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    const changeMemberRole = useCallback(async (memberId: string, roleId: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            const updatedMember = await updateMemberRole(token, memberId, roleId);

            // Update local state
            setMembers(prev =>
                prev.map(m => (m.id === memberId ? updatedMember : m))
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update member role";
            setError(errorMessage);
            console.error("Error updating member role:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    return {
        members,
        loading,
        error,
        fetchMembers,
        changeMemberRole,
    };
}
