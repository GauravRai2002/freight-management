"use client";

import { AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldMismatchAlertProps {
    extraFields: string[];
    missingFields: string[];
    onDismiss: () => void;
}

export function FieldMismatchAlert({ extraFields, missingFields, onDismiss }: FieldMismatchAlertProps) {
    if (extraFields.length === 0 && missingFields.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {extraFields.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium text-amber-800 dark:text-amber-400">
                            {extraFields.length} extra field{extraFields.length > 1 ? "s" : ""} detected
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                            These columns won&apos;t be imported: <span className="font-mono">{extraFields.join(", ")}</span>
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onDismiss} className="h-6 w-6">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {missingFields.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium text-red-800 dark:text-red-400">
                            {missingFields.length} required field{missingFields.length > 1 ? "s" : ""} missing
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                            Please ensure your file contains: <span className="font-mono">{missingFields.join(", ")}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
