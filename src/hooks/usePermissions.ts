"use client";

import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface MemberInfo {
    id: string;
    role: {
        id: string;
        name: string;
        description: string | null;
    };
    permissions: string[];
    joinedAt: string;
}

interface UsePermissionsReturn {
    loading: boolean;
    member: MemberInfo | null;
    role: string | null;
    permissions: string[];
    can: (permission: string) => boolean;
    canAny: (permissions: string[]) => boolean;
    canAll: (permissions: string[]) => boolean;
    isAdmin: boolean;
    isEditor: boolean;
    isViewer: boolean;
    refetch: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
    const { getToken } = useAuth();
    const { organization } = useOrganization();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState<MemberInfo | null>(null);

    const fetchPermissions = useCallback(async () => {
        if (!user || !organization) {
            setMember(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();

            if (!token) {
                setMember(null);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMember(data.member);
            } else {
                setMember(null);
            }
        } catch (error) {
            console.error("Failed to fetch permissions:", error);
            setMember(null);
        } finally {
            setLoading(false);
        }
    }, [user, organization, getToken]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const permissions = member?.permissions || [];
    const roleName = member?.role?.name || null;

    const can = useCallback((permission: string): boolean => {
        if (!member) return false;
        const [resource] = permission.split(":");
        return (
            permissions.includes(permission) ||
            permissions.includes(`${resource}:manage`)
        );
    }, [member, permissions]);

    const canAny = useCallback((perms: string[]): boolean => {
        return perms.some(p => can(p));
    }, [can]);

    const canAll = useCallback((perms: string[]): boolean => {
        return perms.every(p => can(p));
    }, [can]);

    return {
        loading,
        member,
        role: roleName,
        permissions,
        can,
        canAny,
        canAll,
        isAdmin: roleName === "admin",
        isEditor: roleName === "editor",
        isViewer: roleName === "viewer",
        refetch: fetchPermissions,
    };
}
