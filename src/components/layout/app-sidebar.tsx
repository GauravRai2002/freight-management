"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { OrgSwitcher } from "@/components/auth/OrgSwitcher";
import {
    LayoutDashboard,
    Truck,
    Users,
    Building2,
    Receipt,
    CreditCard,
    Package,
    Map,
    BookOpen,
    Wallet,
    FileText,
    RotateCcw,
    DollarSign,
    TruckIcon,
    PackageOpen,
    BarChart3,
    PieChart,
    ChevronRight,
} from "lucide-react";

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navigation: NavSection[] = [
    {
        title: "Overview",
        items: [
            { title: "Dashboard", href: "/", icon: LayoutDashboard },
        ],
    },
    {
        title: "Master Data",
        items: [
            { title: "Vehicles", href: "/master/vehicles", icon: Truck },
            { title: "Drivers", href: "/master/drivers", icon: Users },
            { title: "Billing Parties", href: "/master/parties", icon: Building2 },
            { title: "Transporters", href: "/master/transporters", icon: TruckIcon },
            { title: "Expense Categories", href: "/master/expenses", icon: Receipt },
            { title: "Payment Modes", href: "/master/pay-modes", icon: CreditCard },
            { title: "Stock Items", href: "/master/stock", icon: Package },
        ],
    },
    {
        title: "Transactions",
        items: [
            { title: "Trips", href: "/transactions/trips", icon: Map },
            { title: "Trip Book", href: "/transactions/trip-book", icon: BookOpen },
            { title: "Driver Advance", href: "/transactions/driver-advance", icon: Wallet },
            { title: "Expense Book", href: "/transactions/expense-book", icon: FileText },
            { title: "Return Trips", href: "/transactions/return-trips", icon: RotateCcw },
            { title: "Party Payments", href: "/transactions/party-payments", icon: DollarSign },
            { title: "Market Veh Payments", href: "/transactions/market-veh-payments", icon: TruckIcon },
            { title: "Stock Entries", href: "/transactions/stock-entries", icon: PackageOpen },
        ],
    },
    {
        title: "Reports",
        items: [
            { title: "Trip Report", href: "/reports/trip-report", icon: BarChart3 },
            { title: "Balance Sheet", href: "/reports/balance-sheet", icon: PieChart },
        ],
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
            {/* Header with Org Switcher */}
            <div className="flex h-16 items-center border-b px-3">
                <OrgSwitcher />
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-6">
                    {navigation.map((section) => (
                        <div key={section.title}>
                            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {section.title}
                            </h4>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                                isActive
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                            {isActive && (
                                                <ChevronRight className="ml-auto h-4 w-4" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <Separator />
            <div className="p-4">
                <p className="text-xs text-muted-foreground text-center">
                    © 2026 FleetTracker
                </p>
            </div>
        </div>
    );
}
