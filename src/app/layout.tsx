import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "FleetTracker - Vehicle Fleet Management",
  description: "Comprehensive vehicle fleet management and tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReduxProvider>
              <div className="flex h-screen overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-background">
                  {children}
                </main>
              </div>
              <Toaster />
            </ReduxProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

