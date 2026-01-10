"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDrivers, addDriver, updateDriver, deleteDriver, setLoading } from "@/store/slices/driverSlice";
import { Driver } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useDrivers() {
    const dispatch = useAppDispatch();
    const drivers = useAppSelector((state) => state.drivers.items);
    const loading = useAppSelector((state) => state.drivers.loading);
    const { getAuthContext } = useAuthContext();

    const fetchDrivers = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<Driver[]>("/api/drivers", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setDrivers(data));
        } catch (error) {
            console.error("Failed to fetch drivers:", error);
            toast.error("Failed to load drivers");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createDriver = useCallback(async (data: Omit<Driver, "id" | "createdAt" | "updatedAt" | "debit" | "credit" | "closeBal">) => {
        toast.loading("Creating driver...");
        try {
            const auth = await getAuthContext();
            const driver = await api.post<Driver>("/api/drivers", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addDriver(driver));
            toast.success("Driver created successfully");
            return driver;
        } catch (error) {
            console.error("Failed to create driver:", error);
            toast.error("Failed to create driver");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editDriver = useCallback(async (id: string, updates: Partial<Driver>) => {
        toast.loading("Updating driver...");
        try {
            const auth = await getAuthContext();
            const driver = await api.put<Driver>(`/api/drivers/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateDriver({ id, updates: driver }));
            toast.success("Driver updated successfully");
            return driver;
        } catch (error) {
            console.error("Failed to update driver:", error);
            toast.error("Failed to update driver");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeDriver = useCallback(async (id: string) => {
        toast.loading("Deleting driver...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/drivers/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteDriver(id));
            toast.success("Driver deleted successfully");
        } catch (error) {
            console.error("Failed to delete driver:", error);
            toast.error("Failed to delete driver");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        drivers,
        loading,
        fetchDrivers,
        createDriver,
        editDriver,
        removeDriver,
    };
}
