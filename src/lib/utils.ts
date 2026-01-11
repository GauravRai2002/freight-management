import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
    // Handle NaN, null, undefined
    if (amount === null || amount === undefined || isNaN(amount)) {
        amount = 0;
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: string | Date): string {
    if (!date) return "";
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy");
}

export function formatDateTime(date: string | Date): string {
    if (!date) return "";
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy HH:mm");
}

export function toISODateString(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

export function generateTripNo(): number {
    const stored = localStorage.getItem("lastTripNo");
    const lastNo = stored ? parseInt(stored, 10) : 0;
    const newNo = lastNo + 1;
    localStorage.setItem("lastTripNo", String(newNo));
    return newNo;
}
