"use client";

import { useState, useCallback } from "react";
import { parseImportFile, ParseResult } from "@/lib/importService";
import { TripImportData } from "@/lib/importConfig";
import { prepareBulkImportPayload, BulkImportResponse } from "@/lib/bulkImportService";
import { api } from "@/lib/api";
import { useAuthContext } from "@/hooks/useAuthContext";

interface ImportState {
    step: "upload" | "preview" | "importing" | "complete";
    parseResult: ParseResult | null;
    importProgress: { current: number; total: number; phase: string };
    importResults: {
        success: number;
        failed: number;
        errors: string[];
        categoriesCreated: number;
        expensesCreated: number;
    };
}

export function useImport() {
    const { getAuthContext } = useAuthContext();

    const [state, setState] = useState<ImportState>({
        step: "upload",
        parseResult: null,
        importProgress: { current: 0, total: 0, phase: "" },
        importResults: { success: 0, failed: 0, errors: [], categoriesCreated: 0, expensesCreated: 0 },
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = useCallback(async (file: File) => {
        setIsLoading(true);
        try {
            const result = await parseImportFile(file);
            setState(prev => ({
                ...prev,
                step: result.success ? "preview" : "upload",
                parseResult: result,
            }));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateRowData = useCallback((index: number, field: keyof TripImportData, value: unknown) => {
        setState(prev => {
            if (!prev.parseResult) return prev;
            const newData = [...prev.parseResult.data];
            newData[index] = { ...newData[index], [field]: value };

            // Re-validate the row
            const errors: string[] = [];
            if (!newData[index].tripNo) errors.push("Trip number required");
            if (!newData[index].vehNo) errors.push("Vehicle number required");
            newData[index].isValid = errors.length === 0;
            newData[index].errors = errors;

            return {
                ...prev,
                parseResult: {
                    ...prev.parseResult,
                    data: newData,
                },
            };
        });
    }, []);

    const startImport = useCallback(async () => {
        if (!state.parseResult) return;

        const validData = state.parseResult.data.filter(d => d.isValid);
        if (validData.length === 0) return;

        setState(prev => ({
            ...prev,
            step: "importing",
            importProgress: { current: 0, total: validData.length, phase: "Preparing data..." },
            importResults: { success: 0, failed: 0, errors: [], categoriesCreated: 0, expensesCreated: 0 },
        }));

        try {
            // Prepare bulk payload
            const payload = prepareBulkImportPayload(validData);

            setState(prev => ({
                ...prev,
                importProgress: { current: 0, total: validData.length, phase: "Uploading to server..." },
            }));

            // Call bulk import API
            const auth = await getAuthContext();
            const response = await api.post<BulkImportResponse>(
                "/api/import/bulk",
                payload,
                auth ? { token: auth.token, orgId: auth.orgId } : undefined
            );

            // Process response
            const results = {
                success: response.data?.tripsCreated || 0,
                failed: response.data?.tripsFailed || 0,
                categoriesCreated: response.data?.categoriesCreated || 0,
                expensesCreated: response.data?.expensesCreated || 0,
                errors: response.data?.errors?.map(e =>
                    `${e.type} ${e.index}${e.tripNo ? ` (Trip #${e.tripNo})` : ''}: ${e.message}`
                ) || [],
            };

            setState(prev => ({
                ...prev,
                step: "complete",
                importProgress: { current: validData.length, total: validData.length, phase: "Complete" },
                importResults: results,
            }));

        } catch (error) {
            console.error("Bulk import failed:", error);
            setState(prev => ({
                ...prev,
                step: "complete",
                importResults: {
                    success: 0,
                    failed: validData.length,
                    categoriesCreated: 0,
                    expensesCreated: 0,
                    errors: [error instanceof Error ? error.message : "Bulk import failed"],
                },
            }));
        }

    }, [state.parseResult, getAuthContext]);

    const reset = useCallback(() => {
        setState({
            step: "upload",
            parseResult: null,
            importProgress: { current: 0, total: 0, phase: "" },
            importResults: { success: 0, failed: 0, errors: [], categoriesCreated: 0, expensesCreated: 0 },
        });
    }, []);

    return {
        ...state,
        isLoading,
        handleFileSelect,
        updateRowData,
        startImport,
        reset,
    };
}
