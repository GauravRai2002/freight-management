import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <div className="flex h-screen overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-background">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
