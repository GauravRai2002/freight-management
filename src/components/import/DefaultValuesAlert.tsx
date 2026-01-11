"use client";

import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPTIONAL_TRIP_FIELDS } from "@/lib/importConfig";

interface DefaultValuesAlertProps {
    fieldsUsingDefaults: string[];
    onDismiss: () => void;
}

export function DefaultValuesAlert({ fieldsUsingDefaults, onDismiss }: DefaultValuesAlertProps) {
    if (fieldsUsingDefaults.length === 0) {
        return null;
    }

    // Get display info for each field
    const fieldInfo = fieldsUsingDefaults.map(field => {
        const config = OPTIONAL_TRIP_FIELDS[field];
        return {
            field,
            displayName: config?.displayName || field,
            defaultValue: config?.defaultValue,
        };
    });

    return (
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-400">
                    {fieldsUsingDefaults.length} optional field{fieldsUsingDefaults.length > 1 ? "s" : ""} not found in file
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                    The following fields will use default values:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {fieldInfo.map(({ displayName, defaultValue }) => (
                        <span
                            key={displayName}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 rounded text-xs font-medium text-blue-800 dark:text-blue-300"
                        >
                            {displayName}
                            <span className="text-blue-600 dark:text-blue-400">
                                = {defaultValue === "" ? '""' : String(defaultValue)}
                            </span>
                        </span>
                    ))}
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onDismiss} className="h-6 w-6">
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
