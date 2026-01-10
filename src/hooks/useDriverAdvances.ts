"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDriverAdvances, addDriverAdvance, updateDriverAdvance, deleteDriverAdvance, setLoading } from "@/store/slices/driverAdvanceSlice";
import { DriverAdvance } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useDriverAdvances() {
    const dispatch = useAppDispatch();
    const driverAdvances = useAppSelector((state) => state.driverAdvances.items);
    const loading = useAppSelector((state) => state.driverAdvances.loading);

    const fetchDriverAdvances = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<DriverAdvance[]>("/api/driver-advances");
            dispatch(setDriverAdvances(data));
        } catch (error) {
            console.error("Failed to fetch driver advances:", error);
            toast.error("Failed to load driver advances");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createDriverAdvance = useCallback(async (data: Omit<DriverAdvance, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating driver advance...");
        try {
            const advance = await api.post<DriverAdvance>("/api/driver-advances", data);
            dispatch(addDriverAdvance(advance));
            toast.success("Driver advance created successfully");
            return advance;
        } catch (error) {
            console.error("Failed to create driver advance:", error);
            toast.error("Failed to create driver advance");
            throw error;
        }
    }, [dispatch]);

    const editDriverAdvance = useCallback(async (id: string, updates: Partial<DriverAdvance>) => {
        toast.loading("Updating driver advance...");
        try {
            const advance = await api.put<DriverAdvance>(`/api/driver-advances/${id}`, updates);
            dispatch(updateDriverAdvance({ id, updates: advance }));
            toast.success("Driver advance updated successfully");
            return advance;
        } catch (error) {
            console.error("Failed to update driver advance:", error);
            toast.error("Failed to update driver advance");
            throw error;
        }
    }, [dispatch]);

    const removeDriverAdvance = useCallback(async (id: string) => {
        toast.loading("Deleting driver advance...");
        try {
            await api.delete(`/api/driver-advances/${id}`);
            dispatch(deleteDriverAdvance(id));
            toast.success("Driver advance deleted successfully");
        } catch (error) {
            console.error("Failed to delete driver advance:", error);
            toast.error("Failed to delete driver advance");
            throw error;
        }
    }, [dispatch]);

    return {
        driverAdvances,
        loading,
        fetchDriverAdvances,
        createDriverAdvance,
        editDriverAdvance,
        removeDriverAdvance,
    };
}
