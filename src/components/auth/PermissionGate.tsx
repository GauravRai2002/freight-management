"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { ReactNode } from "react";

interface PermissionGateProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * <PermissionGate permission="vehicles:write">
 *   <Button>Add Vehicle</Button>
 * </PermissionGate>
 * 
 * @example
 * <PermissionGate permission="vehicles:delete" fallback={<span>No access</span>}>
 *   <DeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
    const { can, loading } = usePermissions();

    // Don't render anything while loading
    if (loading) return null;

    // Check permission
    if (!can(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

interface PermissionGateAnyProps {
    permissions: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component that renders children if user has ANY of the specified permissions
 */
export function PermissionGateAny({ permissions, children, fallback = null }: PermissionGateAnyProps) {
    const { canAny, loading } = usePermissions();

    if (loading) return null;

    if (!canAny(permissions)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

interface RoleGateProps {
    roles: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component that renders children if user has one of the specified roles
 * 
 * @example
 * <RoleGate roles={["admin"]}>
 *   <SettingsPanel />
 * </RoleGate>
 */
export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
    const { role, loading } = usePermissions();

    if (loading) return null;

    if (!role || !roles.includes(role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
