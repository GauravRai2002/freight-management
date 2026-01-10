"use client";

import { useState, useEffect } from "react";
import { useOrganizationList, useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, Truck, Mail, Calendar } from "lucide-react";
import { checkInvitations, setupMember, acceptInvitation, Invitation } from "@/lib/authService";

export default function OnboardingPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { createOrganization, setActive } = useOrganizationList();
    const router = useRouter();

    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [checkingInvitations, setCheckingInvitations] = useState(true);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Check for invitations on mount
    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setCheckingInvitations(false);
                    return;
                }

                const pendingInvitations = await checkInvitations(token);
                setInvitations(pendingInvitations); // New endpoint only returns pending invitations
            } catch (err) {
                console.error("Failed to check invitations:", err);
            } finally {
                setCheckingInvitations(false);
            }
        };

        fetchInvitations();
    }, [getToken]);

    const handleAcceptInvitation = async (invitation: Invitation) => {
        setIsLoading(true);
        setError("");

        try {
            const token = await getToken();
            if (!token) {
                setError("Authentication required");
                return;
            }

            const success = await acceptInvitation(token, invitation.id);

            if (success && setActive) {
                await setActive({ organization: invitation.organizationId });
                router.push("/");
            } else {
                setError("Failed to accept invitation");
            }
        } catch (err) {
            console.error("Error accepting invitation:", err);
            setError("Failed to accept invitation");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createOrganization) return;

        setIsLoading(true);
        setError("");

        try {
            const org = await createOrganization({ name: orgName });

            if (setActive) {
                await setActive({ organization: org.id });
            }

            // Setup member with admin role
            const token = await getToken();
            if (token) {
                const result = await setupMember(token, org.id);
                if (!result) {
                    console.warn("Failed to setup member role, but organization was created");
                }
            }

            router.push("/");
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ message: string }> };
            setError(clerkError.errors?.[0]?.message || "Failed to create organization");
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingInvitations) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground">Checking for invitations...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show invitations if they exist and user hasn't chosen to create new org
    if (invitations.length > 0 && !showCreateForm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <Mail className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">You've been invited!</CardTitle>
                            <CardDescription>
                                You have pending invitations to join organizations
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}
                        {invitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="border rounded-lg p-4 space-y-3"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">
                                            {invitation.organizationName || 'Organization'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            Invited {new Date(invitation.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {invitation.roleName && (
                                        <p className="text-sm text-muted-foreground">
                                            Role: <span className="font-medium capitalize">{invitation.roleName}</span>
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handleAcceptInvitation(invitation)}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Join Organization
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <div className="text-center text-sm text-muted-foreground">
                            or
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateForm(true)}
                            disabled={isLoading}
                            className="w-full"
                        >
                            Create New Organization
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Show create organization form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <Truck className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Create your organization</CardTitle>
                        <CardDescription>
                            Welcome{user?.firstName ? `, ${user.firstName}` : ""}! Set up your fleet management organization.
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleCreateOrg}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="orgName"
                                    placeholder="My Fleet Company"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This is typically your company or business name
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={isLoading || !orgName.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Organization
                        </Button>
                        {invitations.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowCreateForm(false)}
                                disabled={isLoading}
                                className="w-full"
                            >
                                Back to Invitations
                            </Button>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
