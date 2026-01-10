"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { useRoles } from "@/hooks/useRoles";
import { inviteMember, getPendingInvitations, deleteInvitation, InvitationItem } from "@/lib/memberService";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function SettingsPage() {
    const { getToken } = useAuth();
    const { members, loading: membersLoading, fetchMembers, changeMemberRole } = useMembers();
    const { roles, loading: rolesLoading, fetchRoles } = useRoles();
    const { can } = usePermissions();

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRoleId, setInviteRoleId] = useState("");
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState("");

    const [invitations, setInvitations] = useState<InvitationItem[]>([]);
    const [loadingInvitations, setLoadingInvitations] = useState(false);

    useEffect(() => {
        fetchMembers();
        fetchRoles();
        loadInvitations();
    }, []);

    const loadInvitations = async () => {
        setLoadingInvitations(true);
        try {
            const token = await getToken();
            if (token) {
                const data = await getPendingInvitations(token);
                setInvitations(data);
            }
        } catch (error) {
            console.error("Failed to load invitations:", error);
        } finally {
            setLoadingInvitations(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !inviteRoleId) return;

        setInviting(true);
        setInviteError("");
        setInviteSuccess("");

        try {
            const token = await getToken();
            if (!token) {
                setInviteError("Authentication required");
                return;
            }

            await inviteMember(token, inviteEmail, inviteRoleId);
            setInviteSuccess(`Invitation sent to ${inviteEmail}`);
            setInviteEmail("");
            setInviteRoleId("");
            loadInvitations();
        } catch (error) {
            setInviteError(error instanceof Error ? error.message : "Failed to send invitation");
        } finally {
            setInviting(false);
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        try {
            const token = await getToken();
            if (!token) return;

            await deleteInvitation(token, invitationId);
            loadInvitations();
        } catch (error) {
            console.error("Failed to cancel invitation:", error);
        }
    };

    const handleRoleChange = async (memberId: string, newRoleId: string) => {
        try {
            await changeMemberRole(memberId, newRoleId);
        } catch (error) {
            console.error("Failed to update role:", error);
        }
    };

    return (
        <div className="flex flex-col">
            <PageHeader
                title="Settings"
                description="Manage your organization members and settings"
            />

            <div className="p-6 space-y-6">
                {/* Invite Member Section */}
                <PermissionGate permission="members:manage">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                <CardTitle>Invite Member</CardTitle>
                            </div>
                            <CardDescription>
                                Send an invitation to join your organization
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInvite} className="space-y-4">
                                {inviteError && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                        {inviteError}
                                    </div>
                                )}
                                {inviteSuccess && (
                                    <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 rounded-md">
                                        {inviteSuccess}
                                    </div>
                                )}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="colleague@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            required
                                            disabled={inviting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={inviteRoleId}
                                            onValueChange={setInviteRoleId}
                                            disabled={inviting || rolesLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id}>
                                                        <span className="capitalize">{role.name}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="submit" disabled={inviting || !inviteEmail || !inviteRoleId}>
                                    {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Invitation
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </PermissionGate>

                {/* Pending Invitations */}
                <PermissionGate permission="members:read">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                            <CardDescription>
                                Invitations waiting to be accepted
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingInvitations ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : invitations.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4">
                                    No pending invitations
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Sent</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.map((invitation) => (
                                            <TableRow key={invitation.id}>
                                                <TableCell>{invitation.email}</TableCell>
                                                <TableCell className="capitalize">
                                                    {invitation.role?.name || 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(invitation.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {can("members:manage") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCancelInvitation(invitation.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </PermissionGate>

                {/* Members List */}
                <PermissionGate permission="members:read">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <CardTitle>Members</CardTitle>
                            </div>
                            <CardDescription>
                                Manage your organization members and their roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {membersLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>{member.user?.email || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {member.user?.firstName || member.user?.lastName
                                                        ? `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {can("members:manage") ? (
                                                        <Select
                                                            value={member.role.id}
                                                            onValueChange={(value) => handleRoleChange(member.id, value)}
                                                            disabled={rolesLoading}
                                                        >
                                                            <SelectTrigger className="w-[150px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {roles.map((role) => (
                                                                    <SelectItem key={role.id} value={role.id}>
                                                                        <span className="capitalize">{role.name}</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <span className="capitalize">{member.role.name}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(member.joinedAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </PermissionGate>
            </div>
        </div>
    );
}
