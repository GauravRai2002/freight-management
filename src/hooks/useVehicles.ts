"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setVehicles, addVehicle, updateVehicle, deleteVehicle, setLoading } from "@/store/slices/vehicleSlice";
import { Vehicle } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useVehicles() {
    const dispatch = useAppDispatch();
    const vehicles = useAppSelector((state) => state.vehicles.items);
    const loading = useAppSelector((state) => state.vehicles.loading);
    const { getAuthContext, isReady } = useAuthContext();

    const fetchVehicles = useCallback(async () => {
        const auth = await getAuthContext();
        if (!auth) {
            console.log("[useVehicles] Skipping fetch - auth not ready");
            return;
        }
        dispatch(setLoading(true));
        try {
            const data = await api.get<Vehicle[]>("/api/vehicles", { token: auth.token, orgId: auth.orgId });
            dispatch(setVehicles(data));
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
            toast.error("Failed to load vehicles");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createVehicle = useCallback(async (data: { vehNo: string; vehType: string }) => {
        const auth = await getAuthContext();
        if (!auth) {
            toast.error("Authentication required");
            throw new Error("Not authenticated");
        }
        toast.loading("Creating vehicle...");
        try {
            const vehicle = await api.post<Vehicle>("/api/vehicles", data, { token: auth.token, orgId: auth.orgId });
            dispatch(addVehicle(vehicle));
            toast.success("Vehicle created successfully");
            return vehicle;
        } catch (error) {
            console.error("Failed to create vehicle:", error);
            toast.error("Failed to create vehicle");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
        const auth = await getAuthContext();
        if (!auth) {
            toast.error("Authentication required");
            throw new Error("Not authenticated");
        }
        toast.loading("Updating vehicle...");
        try {
            const vehicle = await api.put<Vehicle>(`/api/vehicles/${id}`, updates, { token: auth.token, orgId: auth.orgId });
            dispatch(updateVehicle({ id, updates: vehicle }));
            toast.success("Vehicle updated successfully");
            return vehicle;
        } catch (error) {
            console.error("Failed to update vehicle:", error);
            toast.error("Failed to update vehicle");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeVehicle = useCallback(async (id: string) => {
        const auth = await getAuthContext();
        if (!auth) {
            toast.error("Authentication required");
            throw new Error("Not authenticated");
        }
        toast.loading("Deleting vehicle...");
        try {
            await api.delete(`/api/vehicles/${id}`, { token: auth.token, orgId: auth.orgId });
            dispatch(deleteVehicle(id));
            toast.success("Vehicle deleted successfully");
        } catch (error) {
            console.error("Failed to delete vehicle:", error);
            toast.error("Failed to delete vehicle");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        vehicles,
        loading,
        isReady,
        fetchVehicles,
        createVehicle,
        editVehicle,
        removeVehicle,
    };
}
