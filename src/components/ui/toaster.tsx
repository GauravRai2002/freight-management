"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Toast state management
type ToastType = "success" | "error" | "loading" | "default";

interface ToastData {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
}

let toastCallback: ((toast: ToastData) => void) | null = null;

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// Toast utility function
export const toast = {
    success: (title: string, description?: string) => {
        toastCallback?.({ id: generateId(), title, description, type: "success" });
    },
    error: (title: string, description?: string) => {
        toastCallback?.({ id: generateId(), title, description, type: "error" });
    },
    loading: (title: string, description?: string) => {
        toastCallback?.({ id: generateId(), title, description, type: "loading" });
    },
    default: (title: string, description?: string) => {
        toastCallback?.({ id: generateId(), title, description, type: "default" });
    },
};

// Toast component
function ToastItem({
    toast: t,
    onOpenChange,
}: {
    toast: ToastData;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <ToastPrimitive.Root
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
                "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
                {
                    "border-green-500 bg-green-50 dark:bg-green-950": t.type === "success",
                    "border-red-500 bg-red-50 dark:bg-red-950": t.type === "error",
                    "border-blue-500 bg-blue-50 dark:bg-blue-950": t.type === "loading",
                    "border-border bg-background": t.type === "default",
                }
            )}
            onOpenChange={onOpenChange}
        >
            <div className="flex items-center gap-3">
                {t.type === "success" && (
                    <span className="text-green-600 dark:text-green-400">✓</span>
                )}
                {t.type === "error" && (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                )}
                {t.type === "loading" && (
                    <span className="animate-spin text-blue-600 dark:text-blue-400">◌</span>
                )}
                <div className="grid gap-1">
                    <ToastPrimitive.Title className="text-sm font-semibold">
                        {t.title}
                    </ToastPrimitive.Title>
                    {t.description && (
                        <ToastPrimitive.Description className="text-sm opacity-90">
                            {t.description}
                        </ToastPrimitive.Description>
                    )}
                </div>
            </div>
            <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100">
                <X className="h-4 w-4" />
            </ToastPrimitive.Close>
        </ToastPrimitive.Root>
    );
}

// Toaster provider
export function Toaster() {
    const [toasts, setToasts] = React.useState<ToastData[]>([]);

    React.useEffect(() => {
        toastCallback = (newToast) => {
            setToasts((prev) => [...prev, newToast]);
            // Auto dismiss after 4 seconds (except loading)
            if (newToast.type !== "loading") {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
                }, 4000);
            }
        };

        return () => {
            toastCallback = null;
        };
    }, []);

    const handleOpenChange = (id: string, open: boolean) => {
        if (!open) {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }
    };

    return (
        <ToastPrimitive.Provider>
            {toasts.map((t) => (
                <ToastItem
                    key={t.id}
                    toast={t}
                    onOpenChange={(open) => handleOpenChange(t.id, open)}
                />
            ))}
            <ToastPrimitive.Viewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:flex-col sm:max-w-[420px]" />
        </ToastPrimitive.Provider>
    );
}
