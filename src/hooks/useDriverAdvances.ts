"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDriverAdvances, addDriverAdvance, updateDriverAdvance, deleteDriverAdvance, setLoading } from "@/store/slices/driverAdvanceSlice";
import { DriverAdvance } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useDriverAdvances() {
    const dispatch = useAppDispatch();
    const driverAdvances = useAppSelector((state) => state.driverAdvances.items);
    const loading = useAppSelector((state) => state.driverAdvances.loading);
    const { getAuthContext } = useAuthContext();

    const fetchDriverAdvances = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<DriverAdvance[]>("/api/driver-advances", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setDriverAdvances(data));
        } catch (error) {
            console.error("Failed to fetch driver advances:", error);
            toast.error("Failed to load driver advances");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createDriverAdvance = useCallback(async (data: Omit<DriverAdvance, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating driver advance...");
        try {
            const auth = await getAuthContext();
            const advance = await api.post<DriverAdvance>("/api/driver-advances", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addDriverAdvance(advance));
            toast.success("Driver advance created successfully");
            return advance;
        } catch (error) {
            console.error("Failed to create driver advance:", error);
            toast.error("Failed to create driver advance");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editDriverAdvance = useCallback(async (id: string, updates: Partial<DriverAdvance>) => {
        toast.loading("Updating driver advance...");
        try {
            const auth = await getAuthContext();
            const advance = await api.put<DriverAdvance>(`/api/driver-advances/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateDriverAdvance({ id, updates: advance }));
            toast.success("Driver advance updated successfully");
            return advance;
        } catch (error) {
            console.error("Failed to update driver advance:", error);
            toast.error("Failed to update driver advance");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeDriverAdvance = useCallback(async (id: string) => {
        toast.loading("Deleting driver advance...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/driver-advances/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteDriverAdvance(id));
            toast.success("Driver advance deleted successfully");
        } catch (error) {
            console.error("Failed to delete driver advance:", error);
            toast.error("Failed to delete driver advance");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        driverAdvances,
        loading,
        fetchDriverAdvances,
        createDriverAdvance,
        editDriverAdvance,
        removeDriverAdvance,
    };
}
