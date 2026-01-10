"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setVehicles, addVehicle, updateVehicle, deleteVehicle, setLoading } from "@/store/slices/vehicleSlice";
import { Vehicle } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useVehicles() {
    const dispatch = useAppDispatch();
    const vehicles = useAppSelector((state) => state.vehicles.items);
    const loading = useAppSelector((state) => state.vehicles.loading);

    const fetchVehicles = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<Vehicle[]>("/api/vehicles");
            dispatch(setVehicles(data));
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
            toast.error("Failed to load vehicles");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createVehicle = useCallback(async (data: { vehNo: string; vehType: string }) => {
        toast.loading("Creating vehicle...");
        try {
            const vehicle = await api.post<Vehicle>("/api/vehicles", data);
            dispatch(addVehicle(vehicle));
            toast.success("Vehicle created successfully");
            return vehicle;
        } catch (error) {
            console.error("Failed to create vehicle:", error);
            toast.error("Failed to create vehicle");
            throw error;
        }
    }, [dispatch]);

    const editVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
        toast.loading("Updating vehicle...");
        try {
            const vehicle = await api.put<Vehicle>(`/api/vehicles/${id}`, updates);
            dispatch(updateVehicle({ id, updates: vehicle }));
            toast.success("Vehicle updated successfully");
            return vehicle;
        } catch (error) {
            console.error("Failed to update vehicle:", error);
            toast.error("Failed to update vehicle");
            throw error;
        }
    }, [dispatch]);

    const removeVehicle = useCallback(async (id: string) => {
        toast.loading("Deleting vehicle...");
        try {
            await api.delete(`/api/vehicles/${id}`);
            dispatch(deleteVehicle(id));
            toast.success("Vehicle deleted successfully");
        } catch (error) {
            console.error("Failed to delete vehicle:", error);
            toast.error("Failed to delete vehicle");
            throw error;
        }
    }, [dispatch]);

    return {
        vehicles,
        loading,
        fetchVehicles,
        createVehicle,
        editVehicle,
        removeVehicle,
    };
}
