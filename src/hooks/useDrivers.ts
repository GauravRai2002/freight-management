"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDrivers, addDriver, updateDriver, deleteDriver, setLoading } from "@/store/slices/driverSlice";
import { Driver } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useDrivers() {
    const dispatch = useAppDispatch();
    const drivers = useAppSelector((state) => state.drivers.items);
    const loading = useAppSelector((state) => state.drivers.loading);

    const fetchDrivers = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<Driver[]>("/api/drivers");
            dispatch(setDrivers(data));
        } catch (error) {
            console.error("Failed to fetch drivers:", error);
            toast.error("Failed to load drivers");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createDriver = useCallback(async (data: Omit<Driver, "id" | "createdAt" | "updatedAt" | "debit" | "credit" | "closeBal">) => {
        toast.loading("Creating driver...");
        try {
            const driver = await api.post<Driver>("/api/drivers", data);
            dispatch(addDriver(driver));
            toast.success("Driver created successfully");
            return driver;
        } catch (error) {
            console.error("Failed to create driver:", error);
            toast.error("Failed to create driver");
            throw error;
        }
    }, [dispatch]);

    const editDriver = useCallback(async (id: string, updates: Partial<Driver>) => {
        toast.loading("Updating driver...");
        try {
            const driver = await api.put<Driver>(`/api/drivers/${id}`, updates);
            dispatch(updateDriver({ id, updates: driver }));
            toast.success("Driver updated successfully");
            return driver;
        } catch (error) {
            console.error("Failed to update driver:", error);
            toast.error("Failed to update driver");
            throw error;
        }
    }, [dispatch]);

    const removeDriver = useCallback(async (id: string) => {
        toast.loading("Deleting driver...");
        try {
            await api.delete(`/api/drivers/${id}`);
            dispatch(deleteDriver(id));
            toast.success("Driver deleted successfully");
        } catch (error) {
            console.error("Failed to delete driver:", error);
            toast.error("Failed to delete driver");
            throw error;
        }
    }, [dispatch]);

    return {
        drivers,
        loading,
        fetchDrivers,
        createDriver,
        editDriver,
        removeDriver,
    };
}
