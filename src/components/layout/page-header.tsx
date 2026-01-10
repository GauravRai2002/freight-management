"use client";

import { ThemeToggle } from "./theme-toggle";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b bg-background px-6 py-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {children}
                <ThemeToggle />
            </div>
        </div>
    );
}
