/**
 * Member management service for handling member, role, and invitation operations
 */

export interface Member {
    id: string;
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl?: string;
    role: {
        id: string;
        name: string;
        description: string | null;
    };
    joinedAt: string;
    invitedBy?: string | null;
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
}

export interface InvitationItem {
    id: string;
    email: string;
    organizationId: string;
    roleId: string;
    role?: {
        id: string;
        name: string;
    };
    invitedBy: string;
    createdAt: string;
    expiresAt: string;
    status: string;
}

/**
 * Get all members of the organization
 */
export async function getMembers(token: string): Promise<Member[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/members`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }

        const data = await response.json();
        // Handle both formats: direct array or { members: [...] }
        return Array.isArray(data) ? data : (data.members || []);
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
    token: string,
    memberId: string,
    roleId: string
): Promise<Member> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/members/${memberId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roleId }),
        });

        if (!response.ok) {
            throw new Error('Failed to update member role');
        }

        const data = await response.json();
        return data.member;
    } catch (error) {
        console.error('Error updating member role:', error);
        throw error;
    }
}

/**
 * Get all available roles
 */
export async function getRoles(token: string): Promise<Role[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch roles');
        }

        const data = await response.json();
        // Handle both formats: direct array or { roles: [...] }
        return Array.isArray(data) ? data : (data.roles || []);
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
}

/**
 * Invite a new member to the organization
 */
export async function inviteMember(
    token: string,
    email: string,
    roleId: string
): Promise<InvitationItem> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/invite`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, roleId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to send invitation');
        }

        const data = await response.json();
        return data.invitation;
    } catch (error) {
        console.error('Error inviting member:', error);
        throw error;
    }
}

/**
 * Get all pending invitations
 */
export async function getPendingInvitations(token: string): Promise<InvitationItem[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/invitations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch invitations');
        }

        const data = await response.json();
        // Handle both formats: direct array or { invitations: [...] }
        return Array.isArray(data) ? data : (data.invitations || []);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        throw error;
    }
}

/**
 * Cancel/delete an invitation
 */
export async function deleteInvitation(token: string, invitationId: string): Promise<void> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/invite/${invitationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete invitation');
        }
    } catch (error) {
        console.error('Error deleting invitation:', error);
        throw error;
    }
}
