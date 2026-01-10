/**
 * Auth service for handling authentication and authorization API calls
 */

import { api } from './api';

export interface Invitation {
    id: string;
    email: string;
    organizationId: string;
    organizationName?: string;
    roleId: string;
    roleName?: string;
    invitedBy: string;
    createdAt: string;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface InvitationsResponse {
    email: string;
    invitations: Array<{
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
    }>;
    count: number;
}

export interface SetupMemberResponse {
    member: {
        id: string;
        userId: string;
        organizationId: string;
        roleId: string;
        joinedAt: string;
    };
}

/**
 * Check for pending invitations for the current user
 * Uses the new /api/auth/my-invitations endpoint
 */
export async function checkInvitations(token: string): Promise<Invitation[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/my-invitations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch invitations:', response.statusText);
            return [];
        }

        const json = await response.json();
        const data: InvitationsResponse = json.data;

        // Map the new response format to our Invitation interface
        return (data.invitations || []).map(inv => ({
            id: inv.id,
            email: inv.email,
            organizationId: inv.organization.id,
            organizationName: inv.organization.name,
            roleId: inv.role.id,
            roleName: inv.role.name,
            invitedBy: '', // Not provided in new endpoint
            createdAt: inv.createdAt,
            expiresAt: inv.expiresAt,
            status: 'pending' as const,
        }));
    } catch (error) {
        console.error('Error checking invitations:', error);
        return [];
    }
}


/**
 * Setup member with admin role after creating organization
 */
export async function setupMember(token: string, orgId: string): Promise<SetupMemberResponse | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/setup-member`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-organization-id': orgId,
            },
        });

        if (!response.ok) {
            console.error('Failed to setup member:', response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error setting up member:', error);
        return null;
    }
}

/**
 * Accept an invitation to join an organization
 */
export async function acceptInvitation(token: string, invitationId: string): Promise<boolean> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/invitations/${invitationId}/accept`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return false;
    }
}
