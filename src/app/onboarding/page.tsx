"use client";

import { useState } from "react";
import { useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, Truck } from "lucide-react";

export default function OnboardingPage() {
    const { user } = useUser();
    const { createOrganization, setActive } = useOrganizationList();
    const router = useRouter();

    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createOrganization) return;

        setIsLoading(true);
        setError("");

        try {
            const org = await createOrganization({ name: orgName });

            if (setActive) {
                await setActive({ organization: org.id });
            }

            // TODO: Create organization member record with admin role in our database
            // This will be done via API call to backend

            router.push("/");
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ message: string }> };
            setError(clerkError.errors?.[0]?.message || "Failed to create organization");
        } finally {
            setIsLoading(false);
        }
    };

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
                <form onSubmit={handleSubmit}>
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
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading || !orgName.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Organization
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
