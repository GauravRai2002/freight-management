"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStockEntries, addStockEntry, updateStockEntry, deleteStockEntry, setLoading } from "@/store/slices/stockEntrySlice";
import { StockEntry } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useStockEntries() {
    const dispatch = useAppDispatch();
    const stockEntries = useAppSelector((state) => state.stockEntries.items);
    const loading = useAppSelector((state) => state.stockEntries.loading);
    const { getAuthContext } = useAuthContext();

    const fetchStockEntries = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<StockEntry[]>("/api/stock-entries", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setStockEntries(data));
        } catch (error) {
            console.error("Failed to fetch stock entries:", error);
            toast.error("Failed to load stock entries");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createStockEntry = useCallback(async (data: Omit<StockEntry, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating stock entry...");
        try {
            const auth = await getAuthContext();
            const entry = await api.post<StockEntry>("/api/stock-entries", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addStockEntry(entry));
            toast.success("Stock entry created successfully");
            return entry;
        } catch (error) {
            console.error("Failed to create stock entry:", error);
            toast.error("Failed to create stock entry");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editStockEntry = useCallback(async (id: string, updates: Partial<StockEntry>) => {
        toast.loading("Updating stock entry...");
        try {
            const auth = await getAuthContext();
            const entry = await api.put<StockEntry>(`/api/stock-entries/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateStockEntry({ id, updates: entry }));
            toast.success("Stock entry updated successfully");
            return entry;
        } catch (error) {
            console.error("Failed to update stock entry:", error);
            toast.error("Failed to update stock entry");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeStockEntry = useCallback(async (id: string) => {
        toast.loading("Deleting stock entry...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/stock-entries/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteStockEntry(id));
            toast.success("Stock entry deleted successfully");
        } catch (error) {
            console.error("Failed to delete stock entry:", error);
            toast.error("Failed to delete stock entry");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        stockEntries,
        loading,
        fetchStockEntries,
        createStockEntry,
        editStockEntry,
        removeStockEntry,
    };
}
