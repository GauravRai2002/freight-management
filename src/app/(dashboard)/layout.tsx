import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PermissionsProvider } from "@/contexts/PermissionsContext";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <PermissionsProvider>
                <div className="flex h-screen overflow-hidden">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto bg-background">
                        {children}
                    </main>
                </div>
            </PermissionsProvider>
        </AuthGuard>
    );
}

