"use client";

import { useOrganization, useOrganizationList, useUser, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Plus, LogOut, Settings, Check, User } from "lucide-react";

interface OrgMembership {
    organization: {
        id: string;
        name: string;
        imageUrl?: string;
    };
}

export function OrgSwitcher() {
    const { organization, isLoaded: orgLoaded } = useOrganization();
    const { userMemberships, isLoaded: listLoaded, setActive } = useOrganizationList({
        userMemberships: {
            infinite: true,
        },
    });
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    if (!orgLoaded || !listLoaded) {
        return (
            <Button variant="ghost" className="w-full justify-start" disabled>
                <Building2 className="h-4 w-4 mr-2" />
                <span className="truncate">Loading...</span>
            </Button>
        );
    }

    const handleOrgSwitch = async (orgId: string) => {
        if (setActive) {
            await setActive({ organization: orgId });
            setIsOpen(false);
            router.refresh();
        }
    };

    const handleCreateOrg = () => {
        setIsOpen(false);
        router.push("/onboarding");
    };

    const handleSignOut = () => {
        signOut({ redirectUrl: "/sign-in" });
    };

    const orgInitials = organization?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";

    const memberships = userMemberships?.data || [];

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {orgInitials}
                        </div>
                        <span className="truncate font-medium">
                            {organization?.name || "Select Organization"}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate">{user?.firstName} {user?.lastName}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.emailAddresses[0]?.emailAddress}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Organizations
                </DropdownMenuLabel>
                {memberships.map((mem: OrgMembership) => (
                    <DropdownMenuItem
                        key={mem.organization.id}
                        onClick={() => handleOrgSwitch(mem.organization.id)}
                        className="cursor-pointer"
                    >
                        <div className="h-5 w-5 mr-2 rounded bg-muted flex items-center justify-center text-xs">
                            {mem.organization.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate flex-1">{mem.organization.name}</span>
                        {organization?.id === mem.organization.id && (
                            <Check className="h-4 w-4 ml-2 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCreateOrg} className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings/members")} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
